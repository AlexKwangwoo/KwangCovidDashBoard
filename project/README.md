## Covid DashBoard

## TypeScript

0. npm init -y, npm i typescript --save-dev,
1. jsDoc.. -> inside JS file -> typescript
2. Build typescript project and env
   -npm initialize
   -library
   -basic setup
3. js -> ts change (app.js -> app.ts)
4. package json add(build) -> tsc.
5. npm start build -> there will be a lot of errors.
6. noImplicitAny -> true

## Referrance

- [Jhons Hopkins](https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6)
- [Postman API](https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest#27454960-ea1c-4b91-a0b6-0468bb4e6712)
- [Type Vue without Typescript](https://blog.usejournal.com/type-vue-without-typescript-b2b49210f0b)

//json 설명
{
"compilerOptions": {
"allowJs": true,
"target":"ES5",
"outDir": "./built",
//결과물이 어디로
"moduleResolution": "classic"
//promise 인식을 위해
},
"include":[
"./src/**/*"
]
//src밑으로만 컴파일 하겠다!
}
