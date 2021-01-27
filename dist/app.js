var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 엑시오스 같은 경우는 타입스크립트 화가 되어있어서
// 그냥 타입스크립트에 써도 된다.
//하지만 chart는 아직 활성화가 안되어 있다
// import Chart from "chart.js";
// import * as Chart from "chart.js";
// 이건 불러오기위해선 * as 붙여야함.. 특수한 경우임!
// npm install --save @types/chart.js 이거 하니 고쳐짐!
//https://www.typescriptlang.org/dt/search?search= 참고 !!
// 타입스크립이 적용되어있는지./. 적용할수있는지 찾아볼수있다!
//***********************************************/
// 만약 타입스크립트로 정의가 안되어있다면???
// tpyes 폴더와 tsconfig를 수정해줬음..
// utils
function $(selector) {
    const element = document.querySelector(selector);
    return element;
}
function getUnixTimestamp(date) {
    return new Date(date).getTime();
}
// DOM
// let a: Element | HTMLElement | HTMLParagraphElement;
const confirmedTotal = $(".confirmed-total");
const deathsTotal = $(".deaths");
// const deathsTotal:HTMLParagraphElement = $(".deaths") as HTMLParagraphElement;
// 이거는 안됨
//가리키는 엘리먼트가 p이기때문에!!
const recoveredTotal = $(".recovered");
const lastUpdatedTime = $(".last-updated-time");
const rankList = $(".rank-list");
const deathsList = $(".deaths-list");
const recoveredList = $(".recovered-list");
const deathSpinner = createSpinnerElement("deaths-spinner");
const recoveredSpinner = createSpinnerElement("recovered-spinner");
function createSpinnerElement(id) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("id", id);
    wrapperDiv.setAttribute("class", "spinner-wrapper flex justify-center align-center");
    const spinnerDiv = document.createElement("div");
    spinnerDiv.setAttribute("class", "ripple-spinner");
    spinnerDiv.appendChild(document.createElement("div"));
    spinnerDiv.appendChild(document.createElement("div"));
    wrapperDiv.appendChild(spinnerDiv);
    return wrapperDiv;
}
// state
let isDeathLoading = false;
// const isRecoveredLoading = false;
function fetchCovidSummary() {
    const url = "https://api.covid19api.com/summary";
    return axios.get(url);
}
// fetchCovidSummary().then(res => res.data.Countries);
var CovidStatus;
(function (CovidStatus) {
    CovidStatus["Confirmed"] = "confirmed";
    CovidStatus["Recovered"] = "recovered";
    CovidStatus["Deaths"] = "deaths";
})(CovidStatus || (CovidStatus = {}));
function fetchCountryInfo(countryName, status) {
    // params: confirmed, recovered, deaths
    const url = `https://api.covid19api.com/country/${countryName}/status/${status}`;
    return axios.get(url);
}
// methods
function startApp() {
    setupData();
    initEvents();
}
// events
function initEvents() {
    if (!rankList) {
        return;
    }
    rankList.addEventListener("click", handleListClick);
}
function handleListClick(event) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectedId;
        if (event.target instanceof HTMLParagraphElement ||
            event.target instanceof HTMLSpanElement) {
            selectedId = event.target.parentElement
                ? event.target.parentElement.id
                : undefined;
        }
        if (event.target instanceof HTMLLIElement) {
            selectedId = event.target.id;
        }
        if (isDeathLoading) {
            return;
        }
        clearDeathList();
        clearRecoveredList();
        startLoadingAnimation();
        isDeathLoading = true;
        const { data: deathResponse } = yield fetchCountryInfo(selectedId, CovidStatus.Deaths);
        const { data: recoveredResponse } = yield fetchCountryInfo(selectedId, CovidStatus.Recovered);
        const { data: confirmedResponse } = yield fetchCountryInfo(selectedId, CovidStatus.Confirmed);
        endLoadingAnimation();
        setDeathsList(deathResponse);
        setTotalDeathsByCountry(deathResponse);
        setRecoveredList(recoveredResponse);
        setTotalRecoveredByCountry(recoveredResponse);
        setChartData(confirmedResponse);
        isDeathLoading = false;
    });
}
function setDeathsList(data) {
    const sorted = data.sort((a, b) => getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date));
    sorted.forEach((value) => {
        const li = document.createElement("li");
        li.setAttribute("class", "list-item-b flex align-center");
        const span = document.createElement("span");
        span.textContent = value.Cases.toString();
        span.setAttribute("class", "deaths");
        const p = document.createElement("p");
        p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
        li.appendChild(span);
        li.appendChild(p);
        // if (!deathsList) {
        //   return;
        // }
        deathsList.appendChild(li);
    });
}
function clearDeathList() {
    if (!deathsList) {
        return;
    }
    deathsList.innerHTML = "";
}
function setTotalDeathsByCountry(data) {
    deathsTotal.innerText = data[0].Cases.toString();
}
function setRecoveredList(data) {
    const sorted = data.sort((a, b) => getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date));
    sorted.forEach((value) => {
        const li = document.createElement("li");
        li.setAttribute("class", "list-item-b flex align-center");
        const span = document.createElement("span");
        span.textContent = value.Cases.toString();
        span.setAttribute("class", "recovered");
        const p = document.createElement("p");
        p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
        li.appendChild(span);
        li.appendChild(p);
        recoveredList === null || recoveredList === void 0 ? void 0 : recoveredList.appendChild(li);
        // recoveredList가 값이 있으면 li를 추가할것이다..없으면 그냥 리턴!!
        // recoveredList가 null이고 undefined이면 안됨! 그냥 리턴임!
    });
}
function clearRecoveredList() {
    recoveredList.innerHTML = "";
}
function setTotalRecoveredByCountry(data) {
    recoveredTotal.innerText = data[0].Cases.toString();
}
function startLoadingAnimation() {
    deathsList.appendChild(deathSpinner);
    recoveredList.appendChild(recoveredSpinner);
}
function endLoadingAnimation() {
    deathsList.removeChild(deathSpinner);
    recoveredList.removeChild(recoveredSpinner);
}
function setupData() {
    return __awaiter(this, void 0, void 0, function* () {
        //es5 기준으로 하는데 es5는 async없어서 라이브러리를
        // tsjson에 추가한다!
        const { data } = yield fetchCovidSummary();
        setTotalConfirmedNumber(data);
        setTotalDeathsByWorld(data);
        setTotalRecoveredByWorld(data);
        setCountryRanksByConfirmedCases(data);
        setLastUpdatedTimestamp(data);
    });
}
function renderChart(data, labels) {
    const lineChart = $("#lineChart");
    //차트는 캔버스를 이용한다!
    const ctx = lineChart.getContext("2d");
    Chart.defaults.global.defaultFontColor = "#f5eaea";
    Chart.defaults.global.defaultFontFamily = "Exo 2";
    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Confirmed for the last two weeks",
                    backgroundColor: "#feb72b",
                    borderColor: "#feb72b",
                    data,
                },
            ],
        },
        options: {},
    });
}
function setChartData(data) {
    const chartData = data
        .slice(-14)
        .map((value) => value.Cases);
    //최신 14일
    const chartLabel = data
        .slice(-14)
        .map((value) => new Date(value.Date).toLocaleDateString().slice(5, -1));
    renderChart(chartData, chartLabel);
}
function setTotalConfirmedNumber(data) {
    confirmedTotal.innerText = data.Countries.reduce(
    //innerText는 문자만 취급한다
    (total, current) => (total += current.TotalConfirmed), 0).toString();
}
function setTotalDeathsByWorld(data) {
    deathsTotal.innerText = data.Countries.reduce((total, current) => (total += current.TotalDeaths), 0).toString();
}
function setTotalRecoveredByWorld(data) {
    recoveredTotal.innerText = data.Countries.reduce((total, current) => (total += current.TotalRecovered), 0).toString();
}
function setCountryRanksByConfirmedCases(data) {
    const sorted = data.Countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
    sorted.forEach((value) => {
        const li = document.createElement("li");
        li.setAttribute("class", "list-item flex align-center");
        li.setAttribute("id", value.Slug);
        const span = document.createElement("span");
        span.textContent = value.TotalConfirmed.toString();
        span.setAttribute("class", "cases");
        const p = document.createElement("p");
        p.setAttribute("class", "country");
        p.textContent = value.Country;
        li.appendChild(span);
        li.appendChild(p);
        rankList.appendChild(li);
    });
}
function setLastUpdatedTimestamp(data) {
    lastUpdatedTime.innerText = new Date(data.Date).toLocaleString();
}
startApp();
