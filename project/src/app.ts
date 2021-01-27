import axios, { AxiosResponse } from "axios";
import {
  Country,
  ContrySummaryResponse,
  CountrySummaryInfo,
  CovidSummaryResponse,
} from "./covid/index";
// 엑시오스 같은 경우는 타입스크립트 화가 되어있어서
// 그냥 타입스크립트에 써도 된다.
//하지만 chart는 아직 활성화가 안되어 있다

import Chart from "chart.js";
// import * as Chart from "chart.js";
// 이건 불러오기위해선 * as 붙여야함.. 특수한 경우임!
// npm install --save @types/chart.js 이거 하니 고쳐짐!
//https://www.typescriptlang.org/dt/search?search= 참고 !!
// 타입스크립이 적용되어있는지./. 적용할수있는지 찾아볼수있다!
//***********************************************/
// 만약 타입스크립트로 정의가 안되어있다면???
// tpyes 폴더와 tsconfig를 수정해줬음..

// utils
function $<T extends HTMLElement>(selector: string) {
  const element = document.querySelector(selector);
  return element as T;
}
function getUnixTimestamp(date: Date | string) {
  return new Date(date).getTime();
}

// DOM
// let a: Element | HTMLElement | HTMLParagraphElement;
const confirmedTotal = $<HTMLSpanElement>(".confirmed-total");
const deathsTotal = $<HTMLParagraphElement>(".deaths");
// const deathsTotal:HTMLParagraphElement = $(".deaths") as HTMLParagraphElement;
// 이거는 안됨
//가리키는 엘리먼트가 p이기때문에!!
const recoveredTotal = $(".recovered") as HTMLParagraphElement;
const lastUpdatedTime = $(".last-updated-time") as HTMLParagraphElement;
const rankList = $(".rank-list") as HTMLOListElement;
const deathsList = $(".deaths-list") as HTMLOListElement;
const recoveredList = $(".recovered-list") as HTMLOListElement;
const deathSpinner = createSpinnerElement("deaths-spinner");
const recoveredSpinner = createSpinnerElement("recovered-spinner");

function createSpinnerElement(id: string) {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.setAttribute("id", id);
  wrapperDiv.setAttribute(
    "class",
    "spinner-wrapper flex justify-center align-center"
  );
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

function fetchCovidSummary(): Promise<AxiosResponse<CovidSummaryResponse>> {
  const url = "https://api.covid19api.com/summary";
  return axios.get(url);
}

// fetchCovidSummary().then(res => res.data.Countries);

enum CovidStatus {
  Confirmed = "confirmed",
  Recovered = "recovered",
  Deaths = "deaths",
}

function fetchCountryInfo(
  countryName: string | undefined,
  status: CovidStatus
): Promise<AxiosResponse<ContrySummaryResponse>> {
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

async function handleListClick(event: Event) {
  let selectedId;
  if (
    event.target instanceof HTMLParagraphElement ||
    event.target instanceof HTMLSpanElement
  ) {
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
  const { data: deathResponse } = await fetchCountryInfo(
    selectedId,
    CovidStatus.Deaths
  );
  const { data: recoveredResponse } = await fetchCountryInfo(
    selectedId,
    CovidStatus.Recovered
  );
  const { data: confirmedResponse } = await fetchCountryInfo(
    selectedId,
    CovidStatus.Confirmed
  );
  endLoadingAnimation();
  setDeathsList(deathResponse);
  setTotalDeathsByCountry(deathResponse);
  setRecoveredList(recoveredResponse);
  setTotalRecoveredByCountry(recoveredResponse);
  setChartData(confirmedResponse);
  isDeathLoading = false;
}

function setDeathsList(data: ContrySummaryResponse) {
  const sorted = data.sort(
    (a: CountrySummaryInfo, b: CountrySummaryInfo) =>
      getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date)
  );
  sorted.forEach((value: CountrySummaryInfo) => {
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
    deathsList!.appendChild(li);
  });
}

function clearDeathList() {
  if (!deathsList) {
    return;
  }
  deathsList.innerHTML = "";
}

function setTotalDeathsByCountry(data: ContrySummaryResponse) {
  deathsTotal.innerText = data[0].Cases.toString();
}

function setRecoveredList(data: ContrySummaryResponse) {
  const sorted = data.sort(
    (a: CountrySummaryInfo, b: CountrySummaryInfo) =>
      getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date)
  );
  sorted.forEach((value: CountrySummaryInfo) => {
    const li = document.createElement("li");
    li.setAttribute("class", "list-item-b flex align-center");
    const span = document.createElement("span");
    span.textContent = value.Cases.toString();
    span.setAttribute("class", "recovered");
    const p = document.createElement("p");
    p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
    li.appendChild(span);
    li.appendChild(p);
    recoveredList?.appendChild(li);
    // recoveredList가 값이 있으면 li를 추가할것이다..없으면 그냥 리턴!!
    // recoveredList가 null이고 undefined이면 안됨! 그냥 리턴임!
  });
}

function clearRecoveredList() {
  recoveredList.innerHTML = "";
}

function setTotalRecoveredByCountry(data: ContrySummaryResponse) {
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

async function setupData() {
  //es5 기준으로 하는데 es5는 async없어서 라이브러리를
  // tsjson에 추가한다!
  const { data } = await fetchCovidSummary();
  setTotalConfirmedNumber(data);
  setTotalDeathsByWorld(data);
  setTotalRecoveredByWorld(data);
  setCountryRanksByConfirmedCases(data);
  setLastUpdatedTimestamp(data);
}

function renderChart(data: number[], labels: string[]) {
  const lineChart = $("#lineChart") as HTMLCanvasElement;
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

function setChartData(data: ContrySummaryResponse) {
  const chartData = data
    .slice(-14)
    .map((value: CountrySummaryInfo) => value.Cases);
  //최신 14일
  const chartLabel = data
    .slice(-14)
    .map((value: CountrySummaryInfo) =>
      new Date(value.Date).toLocaleDateString().slice(5, -1)
    );
  renderChart(chartData, chartLabel);
}

function setTotalConfirmedNumber(data: CovidSummaryResponse) {
  confirmedTotal.innerText = data.Countries.reduce(
    //innerText는 문자만 취급한다
    (total: number, current: Country) => (total += current.TotalConfirmed),
    0
  ).toString();
}

function setTotalDeathsByWorld(data: CovidSummaryResponse) {
  deathsTotal.innerText = data.Countries.reduce(
    (total: number, current: Country) => (total += current.TotalDeaths),
    0
  ).toString();
}

function setTotalRecoveredByWorld(data: CovidSummaryResponse) {
  recoveredTotal.innerText = data.Countries.reduce(
    (total: number, current: Country) => (total += current.TotalRecovered),
    0
  ).toString();
}

function setCountryRanksByConfirmedCases(data: CovidSummaryResponse) {
  const sorted = data.Countries.sort(
    (a: Country, b: Country) => b.TotalConfirmed - a.TotalConfirmed
  );
  sorted.forEach((value: Country) => {
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

function setLastUpdatedTimestamp(data: CovidSummaryResponse) {
  lastUpdatedTime.innerText = new Date(data.Date).toLocaleString();
}

startApp();
