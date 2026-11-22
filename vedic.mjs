import * as Astronomy from 'astronomy-engine';
const NAK=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const SIGNS=['Mesha (Aries)','Vrishabha (Taurus)','Mithuna (Gemini)','Karka (Cancer)','Simha (Leo)','Kanya (Virgo)','Tula (Libra)','Vrischika (Scorpio)','Dhanu (Sagittarius)','Makara (Capricorn)','Kumbha (Aquarius)','Meena (Pisces)'];
const norm=x=>(x%360+360)%360;
// Approximate Lahiri ayanamsa, for exploratory results only; not a certified Panchang.
function ayanamsa(date){const years=(date.getTime()-Date.UTC(2000,0,1,12))/(365.2425*86400000);return 23.85675+years*0.013969;}
// Exploratory geocentric sidereal ascendant using local apparent sidereal time,
// geographic latitude/longitude, mean obliquity, and the approximate ayanamsa.
// Not a Swiss Ephemeris / certified Lahiri ascendant; near sign boundaries verify externally.
function lagnaAt(date, place){
 const rad=Math.PI/180, lat=place.latitude*rad;
 const jd=date.getTime()/86400000+2440587.5;
 const T=(jd-2451545)/36525;
 const eps=(23+26/60+21.448/3600-(46.8150*T+0.00059*T*T-0.001813*T*T*T)/3600)*rad;
 const lst=norm(Astronomy.SiderealTime(date)*15+place.longitude)*rad;
 const tropical=norm(Math.atan2(-Math.cos(lst),Math.sin(lst)*Math.cos(eps)+Math.tan(lat)*Math.sin(eps))/rad);
 const sidereal=norm(tropical-ayanamsa(date));
 const signIndex=Math.floor(sidereal/30);
 const rulers=['Mangal (Mars)','Shukra (Venus)','Budh (Mercury)','Chandra (Moon)','Surya (Sun)','Budh (Mercury)','Shukra (Venus)','Mangal (Mars)','Guru (Jupiter)','Shani (Saturn)','Shani (Saturn)','Guru (Jupiter)'];
 const degreeInSign=sidereal%30;
 return {rashi:SIGNS[signIndex],signIndex:signIndex+1,degreeInSign:Number(degreeInSign.toFixed(3)),siderealLongitudeDegrees:Number(sidereal.toFixed(4)),lord:rulers[signIndex],method:'Exploratory ascendant from sidereal time, coordinates and approximate Lahiri ayanamsa; verify near sign boundaries with a validated ephemeris',boundaryCaution:degreeInSign<1.5||degreeInSign>28.5};
}
function moon(date){return norm(Astronomy.EclipticGeoMoon(date).lon-ayanamsa(date));}
function result(lon){const n=Math.floor(lon/(360/27));return {nakshatra:NAK[n],pada:Math.floor((lon%(360/27))/(360/108))+1,rashi:SIGNS[Math.floor(lon/30)],siderealLongitudeDegrees:Number(lon.toFixed(4))};}

// Conventional Vimshottari Dasha sequence. Dates are approximate because this beta
// uses an approximate Lahiri ayanamsa and civil-year lengths, not a validated Panchang.
const DASHA_LORDS=['Ketu','Shukra (Venus)','Surya (Sun)','Chandra (Moon)','Mangal (Mars)','Rahu','Guru (Jupiter)','Shani (Saturn)','Budh (Mercury)'];
const DASHA_YEARS=[7,20,6,10,7,18,16,19,17];
const YEAR_MS=365.2425*86400000;
function dashaAtBirth(moonLon,birthDate,atDate=new Date()){
 const nakSize=360/27, index=Math.floor(moonLon/nakSize), frac=(moonLon-index*nakSize)/nakSize;
 const first=index%9, firstDuration=DASHA_YEARS[first]*YEAR_MS;
 let start=birthDate.getTime()-frac*firstDuration;
 let i=first;
 // Iterate forward to the current time, with a guard for dates outside normal human lifespans.
 for(let j=0;j<90;j++){
  const length=DASHA_YEARS[i]*YEAR_MS,end=start+length;
  if(atDate.getTime()<end){
   const elapsed=Math.max(0,atDate.getTime()-start);
   let subStart=start;
   let sub=null;
   for(let k=0;k<9;k++){
    const subIdx=(i+k)%9,subEnd=subStart+length*(DASHA_YEARS[subIdx]/120);
    if(atDate.getTime()<subEnd||k===8){sub={lord:DASHA_LORDS[subIdx],start:new Date(subStart).toISOString().slice(0,10),end:new Date(subEnd).toISOString().slice(0,10)};break;}
    subStart=subEnd;
   }
   return {mahadasha:{lord:DASHA_LORDS[i],start:new Date(start).toISOString().slice(0,10),end:new Date(end).toISOString().slice(0,10)},antardasha:sub,method:'Traditional Vimshottari 120-year cycle from approximate sidereal Moon Nakshatra; exploratory dates only, not verified Panchang'};
  }
  start=end;i=(i+1)%9;
 }
 return null;
}

const cache=new Map();
async function locate(city){
  const parts=String(city||'').split(',').map(x=>x.trim()).filter(Boolean);
  const [cityName,stateName,countryName]=parts;
  if(!cityName)throw Error('Enter a birth city.');
  const key=parts.join(', ').toLowerCase();
  if(cache.has(key))return cache.get(key);
  const u=new URL('https://geocoding-api.open-meteo.com/v1/search');
  u.searchParams.set('name',cityName);
  u.searchParams.set('count','100');
  u.searchParams.set('language','en');
  u.searchParams.set('format','json');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  let r;
  try{r=await fetch(u,{signal:controller.signal})}finally{clearTimeout(timer)}
  if(!r.ok)throw Error('Birth city lookup is temporarily unavailable.');
  const data=await r.json();
  const options=data.results||[];
  if(!options.length)throw Error('Birth city not found. Check the spelling.');
  const norm=s=>String(s||'').toLocaleLowerCase('en').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  const matches=options.filter(x=>norm(x.name)===norm(cityName)&&(!stateName||norm(x.admin1)===norm(stateName))&&(!countryName||(norm(x.country)===norm(countryName)||norm(x.country_code)===norm(countryName))));
  if(!matches.length)throw Error('Could not confirm '+parts.join(', ')+'. Check the city, state and country.');
  const chosen=matches[0];
  if(!chosen.timezone)throw Error('No time zone found for the birth city.');
  const place={name:[chosen.name,chosen.admin1,chosen.country].filter(Boolean).join(', '),latitude:chosen.latitude,longitude:chosen.longitude,timezone:chosen.timezone,ambiguous:matches.length>1,otherMatches:matches.slice(1,4).map(x=>[x.name,x.admin1,x.country].filter(Boolean).join(', '))};
  cache.set(key,place);
  if(cache.size>100)cache.delete(cache.keys().next().value);
  return place;
}
function parts(date,tz){const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);return Object.fromEntries(p.map(x=>[x.type,Number(x.value)]));}
function localToUtc(dob,time,tz){const [y,m,d]=dob.split('-').map(Number),[h,min]=time.split(':').map(Number);const wanted=Date.UTC(y,m-1,d,h,min);let utc=wanted;for(let i=0;i<5;i++){const p=parts(new Date(utc),tz);const local=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute);utc+=wanted-local;}const p=parts(new Date(utc),tz);if(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)!==wanted)throw Error('Birth time is ambiguous or nonexistent due to daylight-saving changes.');return new Date(utc);}
function exploratoryPanchanga(date, tz){
 const sun=norm(Astronomy.Ecliptic(Astronomy.GeoVector('Sun',date,true)).elon-ayanamsa(date));
 const mlon=moon(date), phase=norm(mlon-sun), sum=norm(mlon+sun);
 const tithiIndex=Math.floor(phase/12), yogaIndex=Math.floor(sum/(360/27));
 const tithis=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima / Amavasya'];
 const yogas=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
 const karanas=['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];
 const half=Math.floor(phase/6), karana=half===0?'Kimstughna':half>=57?['Shakuni','Chatushpada','Naga'][Math.min(2,half-57)]:karanas[(half-1)%7];
 return {vara:new Intl.DateTimeFormat('en-IN',{weekday:'long',timeZone:tz}).format(date),tithi:(tithiIndex<15?'Shukla ':'Krishna ')+(tithiIndex===14?'Purnima':tithiIndex===29?'Amavasya':tithis[tithiIndex%15]),yoga:yogas[yogaIndex],karana, nakshatra:result(mlon).nakshatra,method:'Exploratory instant-of-birth calculations with approximate Lahiri correction; not a certified local Panchanga. Sunrise-based Panchanga, sunrise/sunset and boundary timings are not calculated.'};
}
function planetary(date){const out={};for(const [label,body] of [['Surya (Sun)','Sun'],['Budh (Mercury)','Mercury'],['Shukra (Venus)','Venus'],['Mangal (Mars)','Mars'],['Guru (Jupiter)','Jupiter'],['Shani (Saturn)','Saturn']]){try{const lon=norm(Astronomy.Ecliptic(Astronomy.GeoVector(body,date,true)).elon-ayanamsa(date));out[label]={rashi:SIGNS[Math.floor(lon/30)],siderealLongitudeDegrees:Number(lon.toFixed(3))};}catch{}}return out;}
export async function vedicProfile(p){const place=await locate([p.birthCity,p.birthState,p.birthCountry].filter(Boolean).join(', ')||p.city);const [y,m,d]=p.dob.split('-').map(Number);const time=p.birthTime||'';if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Invalid birth time.');const start=localToUtc(p.dob,'00:00',place.timezone),end=localToUtc(p.dob,'23:59',place.timezone);const date=time?localToUtc(p.dob,time,place.timezone):null;const sample=Array.from({length:49},(_,i)=>result(moon(new Date(start.getTime()+(end.getTime()-start.getTime())*i/48))));const candidates=[...new Map(sample.map(x=>[x.nakshatra+' '+x.pada,x])).values()];const stableNakshatra=sample.every(x=>x.nakshatra===sample[0].nakshatra);const stableRashi=sample.every(x=>x.rashi===sample[0].rashi);return {calculation:'Astronomy Engine geocentric Moon and planets with APPROXIMATE Lahiri sidereal correction; exploratory beta, not certified ephemeris',birthplace:place.name,timezone:place.timezone,placeAmbiguous:place.ambiguous,alternativePlaceMatches:place.ambiguous?place.otherMatches:[],birthTimeKnown:!!date,lagna:date?lagnaAt(date,place):null,moon:date?result(moon(date)):null,withoutBirthTime:date?null:{nakshatra:stableNakshatra?sample[0].nakshatra:null,rashi:stableRashi?sample[0].rashi:null,possibleSamples:candidates,note:'49 evenly spaced samples cover the local birth date. Exact Pada and reliable Dasha dates require birth time; boundary uncertainty remains.'},planetarySigns:date?planetary(date):null,dasha:date?dashaAtBirth(moon(date),date):null,panchanga:date?exploratoryPanchanga(date,place.timezone):null,notCalculated:['validated Lagna','planetary houses','Rahu/Ketu','certified sunrise-based Panchanga','muhurta'],warning:'Lagna is an exploratory calculation using approximate Lahiri correction; verify near sign boundaries. Dasha dates are exploratory and can shift with birth-time, ayanamsa and ephemeris differences. Never infer houses. Birthplace geocoding may choose the wrong city when names are ambiguous.'};}
