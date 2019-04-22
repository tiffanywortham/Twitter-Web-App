"use strict";

window.onload = function() {
    
    let loginFunction = function(){
        window.location = '/../auth/twitter';
    };
    
    let logoutFunction = function(){
        window.location = '/../auth/logout'; 
    };
    
    let profileFunction = function(){
        window.location = '/../protected';
    };
    
    let tweetsFunction = function(){
        window.location = '/../hashtag/CSC365';
    };
    
    let chartFunction = function(){
        window.location = '/../chart/CSC365';
    };
    
    document.getElementById("login").addEventListener("click", loginFunction);
    document.getElementById("logout").addEventListener("click", logoutFunction);
    document.getElementById("profile").addEventListener("click", profileFunction);
    document.getElementById("tweets").addEventListener("click", tweetsFunction);
    document.getElementById("chart").addEventListener("click", chartFunction);
      
};