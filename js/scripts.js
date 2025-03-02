const pathName = window.location.pathname;
const pageName = pathName.split("/").pop();

if(pageName === "home.html") {
    document.querySelector(".start").classList.add("active-link");
} 
if(pageName === "posts.html") {
    document.querySelector(".posts").classList.add("active-link");
} 
if(pageName === "contact.html") {
    document.querySelector(".contact").classList.add("active-link");
}