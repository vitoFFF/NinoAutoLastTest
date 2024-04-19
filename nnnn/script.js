let lattext = document.getElementById("lat");
let longtext = document.getElementById("long");
let nearestDistance = document.getElementById("dist");
let userLocationMarker;
let action = document.getElementById("action");


let polylineCoords = [
  [41.9250631, 42.0128077],
  [41.9257096, 42.0148623],
  [41.9264959, 42.0172012],
  [41.9269629, 42.0184672],
  [41.9279886, 42.0208222],
  [41.9290302, 42.0232683]
];

let sumLat = polylineCoords.reduce((acc, val) => acc + val[0], 0);
let sumLng = polylineCoords.reduce((acc, val) => acc + val[1], 0);

let avgLat = sumLat / polylineCoords.length;
let avgLng = sumLng / polylineCoords.length;

let map = L.map('map').setView([avgLat, avgLng], 17.2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

polylineCoords.forEach((coord, index) => {
    let color = 'cyan';
    if (index === 0) color = 'red'; // Start point
    else if (index === polylineCoords.length - 1) color = 'black'; // End point

    let circleMarker = L.circleMarker(coord, {color: color, fillColor: 'blue', fillOpacity: 1, radius: 20}).addTo(map);
    animateBreathing(circleMarker); // Apply breathing animation to each marker
});

let polyline = L.polyline(polylineCoords, {color: 'blue', weight: 5, dashArray: '12, 12'}).addTo(map);

// Function to animate "breathing" effect
function animateBreathing(circle) {
    let minRadius = 12;
    let maxRadius = 18;
    let deltaRadius = 1;
    let increasing = true;
    setInterval(() => {
        let currentRadius = circle.getRadius();
        if (increasing) {
            currentRadius += deltaRadius;
            if (currentRadius >= maxRadius) increasing = false;
        } else {
            currentRadius -= deltaRadius;
            if (currentRadius <= minRadius) increasing = true;
        }
        circle.setRadius(currentRadius);
    }, 150);
}



function updateLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(position) {
      const { latitude, longitude } = position.coords;
      lattext.textContent = "Latitude: " + latitude;
      longtext.textContent = "Longitude: " + longitude;

      // Update nearest distance
      let nearest = getNearestPoint(position.coords, polylineCoords);
      nearestDistance.textContent = "Nearest Point Distance: " + nearest.distance.toFixed(2) + " meters";

      // Update the user's location on the map
      const currentPosition = [latitude, longitude];
      if (!userLocationMarker) {
        userLocationMarker = L.circleMarker(currentPosition, {
          color: 'green',
          fillColor: '#0f0',
          fillOpacity: 0.8,
          radius: 10
        }).addTo(map);
      } else {
        userLocationMarker.setLatLng(currentPosition);
      }

    }, function(error) {
      console.error("Error Code = " + error.code + " - " + error.message);
      nearestDistance.textContent = "Error obtaining GPS data.";
    });
  } else {
    lattext.textContent = "Latitude: Geolocation is not supported by this browser.";
    longtext.textContent = "Longitude: Geolocation is not supported by this browser.";
    nearestDistance.textContent = "Geolocation is not supported by this browser.";
  }
}

function getNearestPoint(currentCoords, points) {
  let nearest = null;
  let minDistance = 50;
  points.forEach(function(point) {
    let distance = L.latLng(currentCoords.latitude, currentCoords.longitude).distanceTo(L.latLng(point[0], point[1]));
    if (distance < minDistance) {
      action.innerText = "yes";
      nearest = { point: point, distance: distance };
    } else {
      action.innerText = "no";
      nearest = { point: point, distance: distance };
    }
  });
  return nearest;
}
updateLocation()