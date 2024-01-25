
mapboxgl.accessToken = mapToken;

//"pk.eyJ1IjoiZGVsdGEtc3R1ZHVlbnQiLCJhIjoiY2xvMDk0MTVhMTJ3ZDJrcGR5ZDFkaHl4ciJ9.Gj2VU1wvxc7rFVt5E4KLOQ"
const map = new mapboxgl.Map({
    container: "map", // container ID
    // Choose from Mapbox's coreTstyles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});




const marker = new mapboxgl.
Marker({color:"red"})
.setLngLat(listing.geometry.coordinates).
setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(`<h4>${listing.title}</h4> <p> Exact Location provided after booking`)).
addTo(map)