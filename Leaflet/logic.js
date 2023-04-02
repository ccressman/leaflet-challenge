// Store API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateUrl = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json"

// Create base layer
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Create base map to display on load.
var myMap = L.map("map", {
    center: [39, -50],
    zoom: 2.5,
    layers: [street,]
});

//create variable for earthquakes and tectonic plates layer groups (to toggle)
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

var baseMaps = { "Global Earthquakes": street }
var overlayMaps = { "Earthquakes": earthquakes,
"Tectonic Plates": tectonicPlates }

// Create a layer control.
// Pass in baseMaps and overlayMaps.
// Add layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false //toggle to remain (no collapse)
}).addTo(myMap);


// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    //define style function that will use markercolor and markersize functions for marker color and size
    function styleInfo(feature) {
        return {
            fillColor: markerColor(feature.geometry.coordinates[2]),
            radius: markerSize(feature.properties.mag),
            fillOpacity: 0.75,
            stroke: false //remove outline
        }
    }
    //define function for markerColor to create color scale communicating earthquake depth. 
    //Marker color darkens with increased depth
    function markerColor(depth) {
        if (depth > 90) {
            return "#317F90";
        }
        if (depth > 70) {
            return "#3C9BB0";
        }
        if (depth > 50) {
            return "#45ACC3";
        }
        if (depth > 30) {
            return "#4ABCD6";
        }
        if (depth > 10) {
            return "#50CCE7";
        }
        return "#C6EFF9";
    }

    //define style function that will link size of marker to earthquake magnitude (higher magnitude tied to larger radius)
    function markerSize(mag) {
        if (mag === 0) {
            return 1;
        }
        return Math.sqrt(mag) * 10;
    }

    
    L.geoJson(data, {
        pointToLayer: function (feature, latlng){
            return L.circleMarker(latlng); //create circle marker
        },
        style: styleInfo, //use style info function for style parameters
        onEachFeature: function (feature, layer){ //add popup with magnitude, depth, time, and location of earthquake
            layer.bindPopup("<h3>" + "Earthquake Magnitude: " + feature.properties.mag + "<hr>"+
            "Depth: " + feature.geometry.coordinates[2]+ "<hr>"+
            "Time: " + new Date(feature.geometry.time)+ "<hr>"+
            "Location: " + feature.properties.place  + "</h3>");
        }
        }).addTo(earthquakes);

    earthquakes.addTo(myMap);

    // Add Legend
    //https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: "topright"});
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
        mags = [0, 10, 30, 50, 70, 90],
        labels = [];
        legendText = "<h3>Degree of Magnitude<h3>";

        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
            '<i style="background:' + markerColor(mags[i] + 1) + '"></i>' + mags[i] + (mags[i + 1] ? '&ndash;' + mags [i +1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);

    //Add tectonic plates 
    d3.json(plateUrl).then(function (plates) {
        L.geoJson(plates, {
            color: "red",
            weight: "2.5"
        }).addTo(tectonicPlates);
        tectonicPlates.addTo(myMap);
    });

});