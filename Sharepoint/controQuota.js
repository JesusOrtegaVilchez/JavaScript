/*Desarrollo de un script que se ejecute para cada uno de los subsitios dentro de un sitio de sharepoint y calcule el tamaño 
total de cada subsitio sumando los tamaños de cada lista o biblioteca dentro de ese subsitio.
Hasta el momento solo he conseguido que calcule el tamaño de un subsitio pero no encuentro la forma de ejecutarlo 
para cada uno de los subsitios que me devuelve la funcion retrieveSubsites() 
*/
$(document).ready(function () { //importante añadir libreria jquery 
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', retrieveWebSiteProperties);
    var objListColl = [];
    var listTotalSize = [];
    var webtotalSize = 0;
    var web_sTotalSize = 0;
    var objWebsColl = [];
    var listTotalSizeWebs = [];
    //var objSitesColl = [];
    var urlRelativa;
      //var nameWeb = new SP.WebInformation.get_title();
    function retrieveWebSiteProperties() {
        var clientContext = new SP.ClientContext.get_current();
        var url_p = "https://clouzy.sharepoint.com/sites/aletas";//get site

        oWebsite = clientContext.get_web();
        //oSite = clientContext.get_site();
        oLists = oWebsite.get_lists();
        websColl = oWebsite.get_webs();
        //oItems = oList.getItems();
        //clientContext.load(oList, 'ItemCount');
        //clientContext.load(oSite);
        clientContext.load(oWebsite);
        clientContext.load(oLists,'Include(DefaultViewUrl)');
        clientContext.load(websColl,'Include(Title,Url)');
        //clientContext.load(oItems);
        clientContext.executeQueryAsync(onQuerySucceeded, onQueryFailed);

    }
    function onQuerySucceeded() {
        function extractUrl() { //extrae las url relativas de cada lista o bilblioteca dentro de un sitio
            for (var x = 0; x < oLists.get_count() ; x++) {
            var flag = false;
            var olist = oLists.itemAt(x);
            var listUrl = olist.get_defaultViewUrl();
            
            /*Si lo encuentra imprime desde la posicion 0 hasta antes de /Forms/*/
            if (listUrl.indexOf("/Forms/") != -1 && listUrl.indexOf("/_catalogs") == -1) {
                listUrl = listUrl.substring(0, listUrl.indexOf("/Forms/"));
                flag = true;
            }
            else /*si no lo encuentra busca si hay alguna coincidencia con /Lists/*/ {

                //{
                var listIndex = listUrl.indexOf("/Lists/");
                if (listIndex != -1)/*Si encuentra el /Lists/ imprime desde la posicion 0 hasta la utlima '/' */ 
                {
                    listUrl = listUrl.substring(0, listUrl.lastIndexOf("/"));
                    flag = true;
                }
            }
            if (flag) {
                var objList = {Indice: x, Url: listUrl};
                objListColl.push(objList);
            }

        };
    }

        
            extractUrl();
            
            
            //alert('La url del sitio es: '+ objListColl[x].Url);
        
    
        function retrieveSubsites(){ //devuelve el nombre de la url de los subsitios
        
        var enumerator = websColl.getEnumerator();
        while(enumerator.moveNext()){
        var subsite = enumerator.get_current();
        var subsiteSize = 0;
        var objWebs = {Name: subsite.get_title(),Url:subsite.get_url(),Size: subsiteSize};
        objWebsColl.push(objWebs);
       }
    }
    
    retrieveSubsites();
    /
   
        
       function aPI_Request(urlRelativa) { //peticion al servicio web que me devuelve el tamaño en bytes de cada lista o biblioteca que contenga un sitio
            $.ajax({			/* IMPORTANTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! COMILLAS SIMPLES Y DOBLES EN ESTE ORDEN, SINO FALLA!!!!!!*/
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/getFolderByServerRelativeUrl(\'" + urlRelativa + "\')?$select=StorageMetrics&$expand=StorageMetrics",
                type: "GET", /* NO ES "METHOD" ES "TYPE"*/
                headers: { "Accept": "application/json; odata = verbose" },
                success: function (data) {
                    var totalSize = data.d.StorageMetrics.TotalSize;
                    //alert(totalSize);
                    //setTimeout(alert(totalSize,2000));
                    listTotalSize.push(totalSize);
                    webtotalSize += Number(totalSize);
                    //listTotalSizeWebs.push(webtotalSize);
                    objWebsColl[indice].Size = webtotalSize;
                   //setTimeout(alert('+'\n'+ 'Tamaño del subsitio: ' + webtotalSize,2000));
                    $('#contenedor').html(webtotalSize);
                    
                },
                error: function (sender, args) {
                    alert('Request failed. ' + args +
							'\n' + sender.responseJSON.error.message.value);
                }
            })
        }

        var promesas = [];
        for (var j = 0; j < objListColl.length; j++) {
            promesas.push(aPI_Request(objListColl[j].Url,j));
        };
        //setTimeout(alert(webtotalSize),300000);

        Promise.all(promesas).then(function () {
            alert(webtotalSize);
        });

       /* function arrayPromesas(){
            for (var j=0; j<objListColl.length; j++){
                var pr = new Promise(function(resolve,reject){
                    aPI_Request(objListColl[j].Url, j);
                });
            }
        }*/
        
        
        /*function promesa(){
            var p = new Promise(function(resolve, reject){ 
                    for (var j=0; j<objListColl.length; j++){
                        var urlRelativa2 = objListColl[j].Url;
                        aPI_Request(urlRelativa2);
                    };	
                        if(objListColl.length == listTotalSize.length){
                        resolve("se han introducido los valores correctamente");
                        }
                        
                    else{
                        reject(Error("algo salio mal"));
                    }
                    
                });
                p.then(function(response){
                    console.log(response);
                    //colocar la suma
                        alert("tamaño del array: "+listTotalSize[0]);

                }, function(error){
                    console.log(error);
                })
        }


            
        }
        promesa();
*/
        
    
    }

    function onQueryFailed(sender,args) {
        console.log(args.get_message());
    }



});
