(()=>{var e={};e.id=266,e.ids=[266],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},9428:e=>{"use strict";e.exports=require("buffer")},5511:e=>{"use strict";e.exports=require("crypto")},4735:e=>{"use strict";e.exports=require("events")},1630:e=>{"use strict";e.exports=require("http")},5591:e=>{"use strict";e.exports=require("https")},1645:e=>{"use strict";e.exports=require("net")},3873:e=>{"use strict";e.exports=require("path")},1997:e=>{"use strict";e.exports=require("punycode")},7910:e=>{"use strict";e.exports=require("stream")},4631:e=>{"use strict";e.exports=require("tls")},9551:e=>{"use strict";e.exports=require("url")},4075:e=>{"use strict";e.exports=require("zlib")},324:(e,s,r)=>{"use strict";r.r(s),r.d(s,{GlobalError:()=>n.a,__next_app__:()=>p,pages:()=>c,routeModule:()=>x,tree:()=>l});var t=r(4482),a=r(6741),i=r(205),n=r.n(i),d=r(9426),o={};for(let e in d)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>d[e]);r.d(s,o);let l=["",{children:["tickets",{children:["[id]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,1942)),"C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\tickets\\[id]\\page.tsx"]}]},{error:[()=>Promise.resolve().then(r.bind(r,9833)),"C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\tickets\\[id]\\error.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,2319)),"C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\tickets\\[id]\\loading.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,2947)),"C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,3022,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,2871,23)),"next/dist/client/components/unauthorized-error"]}],c=["C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\tickets\\[id]\\page.tsx"],p={require:r,loadChunk:()=>Promise.resolve()},x=new t.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/tickets/[id]/page",pathname:"/tickets/[id]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},350:(e,s,r)=>{Promise.resolve().then(r.bind(r,9833))},3398:(e,s,r)=>{Promise.resolve().then(r.bind(r,1037))},4645:(e,s,r)=>{Promise.resolve().then(r.bind(r,1942))},6501:(e,s,r)=>{Promise.resolve().then(r.bind(r,9818))},2131:()=>{},2379:()=>{},1037:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>n});var t=r(1774);r(47);var a=r(4213),i=r.n(a);function n({error:e,reset:s}){return(0,t.jsx)("div",{className:"min-h-screen bg-gray-100 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8",children:(0,t.jsx)("div",{className:"max-w-max mx-auto",children:(0,t.jsxs)("main",{className:"sm:flex",children:[(0,t.jsx)("p",{className:"text-4xl font-bold text-indigo-600 sm:text-5xl",children:"404"}),(0,t.jsxs)("div",{className:"sm:ml-6",children:[(0,t.jsxs)("div",{className:"sm:border-l sm:border-gray-200 sm:pl-6",children:[(0,t.jsx)("h1",{className:"text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl",children:"Ticket not found"}),(0,t.jsx)("p",{className:"mt-1 text-base text-gray-500",children:"Please check the URL and try again."})]}),(0,t.jsxs)("div",{className:"mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6",children:[(0,t.jsx)(i(),{href:"/tickets",className:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",children:"Go back to tickets"}),(0,t.jsx)("button",{onClick:s,className:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",children:"Try again"})]})]})]})})})}},9818:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>l});var t=r(1774),a=r(5640),i=r(9915),n=r(91),d=r(7816),o=r(47);function l(){let e=(0,d.useParams)();if(!e?.id)return null;let s=e.id,r=new a.BD((0,n.S)()),[l,c]=(0,o.useState)(null),[p,x]=(0,o.useState)([]),[m,u]=(0,o.useState)(null);return m?(0,t.jsx)("div",{className:"min-h-screen bg-gray-100",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",children:(0,t.jsx)("div",{className:"px-4 py-6 sm:px-0",children:(0,t.jsx)("div",{className:"rounded-md bg-red-50 p-4",children:(0,t.jsx)("div",{className:"text-sm text-red-700",children:m})})})})}):l?(0,t.jsxs)("div",{className:"min-h-screen bg-gray-100",children:[(0,t.jsx)("header",{className:"bg-white shadow",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8",children:(0,t.jsx)("h1",{className:"text-2xl font-bold text-gray-900",children:"Ticket Details"})})}),(0,t.jsx)("main",{className:"max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",children:(0,t.jsx)("div",{className:"px-4 py-6 sm:px-0",children:(0,t.jsx)(i.G,{ticket:l,messages:p,onSendMessage:async(e,t)=>{await r.replyToTicket(s,e),x(await r.getTicketMessages(s))}})})})]}):(0,t.jsx)("div",{className:"min-h-screen bg-gray-100",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",children:(0,t.jsx)("div",{className:"px-4 py-6 sm:px-0",children:(0,t.jsx)("div",{className:"text-center",children:"Loading..."})})})})}},9833:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>t});let t=(0,r(4658).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\schol\\\\OneDrive\\\\Documents\\\\Github\\\\Week 3-4\\\\autocrm-redux\\\\packages\\\\apps\\\\portal\\\\app\\\\tickets\\\\[id]\\\\error.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\tickets\\[id]\\error.tsx","default")},2319:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>a});var t=r(9154);function a(){return(0,t.jsx)("div",{className:"min-h-screen bg-gray-100",children:(0,t.jsxs)("div",{className:"animate-pulse",children:[(0,t.jsx)("header",{className:"bg-white shadow",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8",children:(0,t.jsx)("div",{className:"h-8 bg-gray-200 rounded w-1/4"})})}),(0,t.jsx)("main",{className:"max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",children:(0,t.jsxs)("div",{className:"px-4 py-6 sm:px-0",children:[(0,t.jsx)("div",{className:"bg-white shadow sm:rounded-lg",children:(0,t.jsx)("div",{className:"px-4 py-5 sm:p-6",children:(0,t.jsxs)("div",{className:"space-y-4",children:[(0,t.jsx)("div",{className:"h-6 bg-gray-200 rounded w-3/4"}),(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-1/4"}),(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded"}),(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded"}),(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-5/6"})]}),(0,t.jsx)("div",{className:"border-t border-gray-200 pt-4",children:(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-1/2"}),(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-1/2"})]})})]})})}),(0,t.jsx)("div",{className:"mt-6 bg-white shadow sm:rounded-lg",children:(0,t.jsx)("div",{className:"px-4 py-5 sm:p-6",children:(0,t.jsx)("div",{className:"space-y-4",children:[1,2,3].map(e=>(0,t.jsxs)("div",{className:"bg-gray-50 rounded-lg p-4",children:[(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-1/4"}),(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-1/6"})]}),(0,t.jsxs)("div",{className:"mt-2 space-y-2",children:[(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded"}),(0,t.jsx)("div",{className:"h-4 bg-gray-200 rounded w-5/6"})]})]},e))})})})]})})]})})}},1942:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>t});let t=(0,r(4658).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\schol\\\\OneDrive\\\\Documents\\\\Github\\\\Week 3-4\\\\autocrm-redux\\\\packages\\\\apps\\\\portal\\\\app\\\\tickets\\\\[id]\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\schol\\OneDrive\\Documents\\Github\\Week 3-4\\autocrm-redux\\packages\\apps\\portal\\app\\tickets\\[id]\\page.tsx","default")}};var s=require("../../../webpack-runtime.js");s.C(e);var r=e=>s(s.s=e),t=s.X(0,[65,682,213,137,128],()=>r(324));module.exports=t})();