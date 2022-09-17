const $dateForm = document.querySelector("#busForm");
const $date = document.querySelector("#date");
const $log = document.querySelector("#log");

const $from = document.querySelector("#from");
const $to = document.querySelector("#to");

$date.value = getDate(1);

const $routes = document.querySelector("#routes");
const $listeners = document.querySelector("#listeners");
let listeners = [{id: 1140333}];

renderListeners();
populateSelects();
fetchRoutes().then(renderRoutes);
$from.addEventListener("change", e => fetchRoutes().then(renderRoutes));
$to.addEventListener("change", e => fetchRoutes().then(renderRoutes));
setInterval(listen, 10_000)

document.querySelector("#date").addEventListener("change", e => {
    e.preventDefault();
    fetchRoutes().then(renderRoutes);
});

function renderRoutes(routes) {
    const tbody = $routes.querySelector("tbody");
    tbody.innerHTML = routes
        .map(route => `
<tr>
<td>${route.id}</td>
<td>${route.dateDeparture}</td>
<td>${route.timeDeparture}</td>
<td>${route.freePlaces}</td>
<td><button ${!!route.freePlaces ? "disabled" : ""} onCLick="addRouteListener(${route.id})">Слушать</button></td>
</tr>`)
        .join("");
}

async function fetchRoutes(date) {
    const url = new URL("https://buspro.by/api/trip?s%5Bcompany_id%5D=15&actual=1");
    url.searchParams.set("s[date_departure]", $date.value);
    url.searchParams.set("s[city_departure_id]", $from.value);
    url.searchParams.set("s[city_destination_id]", $to.value);
    const response = await fetch(url.toString());
    const routes = Object.values(await response.json())
    return routes;
}

function getDate(value) {
    let date = new Date();
    date.setDate((date.getDate() + value));
    return date.toISOString().slice(0, 10);
}

function addRouteListener(id) {
    listeners.push({id})
    renderListeners();
}

function removeRouteListener(id) {
    listeners = listeners.filter(listener => listener.id !== id);
    renderListeners();
}

function renderListeners() {
    $listeners.innerHTML = listeners.map(listener => `
<div class="listener">
    <p>${listener.id}</p>
    <button onCLick="removeRouteListener(${listener.id})">Прекратить слушать</button>
</div>`).join("")
}

async function listen() {
    for (let listener of listeners) {
        const response = await fetch(`https://buspro.by/api/trip/${listener.id}`);
        const route = await response.json();
        if (route.freePlaces) notifyRouteFound(listener.id);
    }
}

function notifyRouteFound(id) {
    const audio = new Audio("beep.mp3");
    audio.play();
    const $logger = document.createElement("div");
    $logger.innerHTML = "Есть места на " + id;
    $log.append($logger);

    setTimeout(() => {
        $logger.remove();
    }, 10_000);

    navigator.vibrate(500);
    new Notification("Есть места на " + id);
}

function populateSelects() {
    const destinations = {
        101: "Минск",
        102: "Столбцы"
    };
    const innerHtml = Object.entries(destinations).map(([id, name]) => `<option value="${id}">${name}</option>`).join("");

    $from.innerHTML = innerHtml;
    $to.innerHTML = innerHtml;
}