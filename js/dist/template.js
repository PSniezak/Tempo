this["templates"] = this["templates"] || {};
this["templates"]["experience"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<section id=\"experience\">\n  <h1>Experience</h1>\n\n  <em>Ici est la vue pour l'experience, là où se trouve les samples et la scène.</em>\n\n  <a href=\"/\">Revenir à la home</a>\n</section>\n";
},"useData":true});
this["templates"]["genre"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<section id=\"genre\">\n\n	<h2>Genre</h2>\n\n  <br/>\n  <em>Ici se trouve l'écran de selection des différents styles musicaux.</em>\n  <br/>\n	<a href=\"/experience\">Aller sur l'experience</a>\n  <br/>\n	<a href=\"/\">Revenir sur la home</a>\n\n</section>";
},"useData":true});
this["templates"]["home"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<section id=\"home\">\n\n	<h2>La Home</h2>\n	<br />\n	<a href=\"/genre\">Aller vers les genres</a>\n</section>";
},"useData":true});
this["templates"]["loader"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<section id=\"loader\">\n  <span>Chargement, lol.</span>\n</section>";
},"useData":true});