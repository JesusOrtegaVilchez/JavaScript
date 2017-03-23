$(document).ready(function () { //importante añadir libreria jquery 
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', retrieveWebSiteProperties);
    var objListColl = [];
    var enumItems;
    var clientContext;
    var listTotalSize = [];
    var webtotalSize = 0;
    var webSizeforFilter = 0;
    var objWebs;
    var tamanio = 0;
    var objWebsFilter;
    var tamanioFiltro = 0;
    var objWebsCollFilter = [];
    var size;
    var subSite;
    var webColl = [];
    var oLists = [];
    var objWebsColl = [];
    var collListItems =[];
    var urlRelativa;
      //var nameWeb = new SP.WebInformation.get_title();
    function retrieveWebSiteProperties() {
        clientContext = SP.ClientContext.get_current();
        var rootWeb = clientContext.get_web();
        webColl = rootWeb.get_webs();
        //var url_p = "https://clouzy.sharepoint.com/sites/aletas";//get site
        var oList = rootWeb.get_lists().getByTitle('Lista de sitios');  // clientContext.get_web().get_lists().getByTitle('Lista de sitios');
        //var camlQuery = new SP.CamlQuery();
        var camlAllItems = SP.CamlQuery.createAllItemsQuery();
        //camlQuery.set_viewXml('<View><Query><Where><Contains><FieldRef Name=\'FullUrl\'/>'+ '<Value Type= \'URL\'>/sites/aletas/admin/</Value></Contains></Where></Query></View>');
        clientContext.load(rootWeb);
        clientContext.load(webColl);
        collListItems = oList.getItems(camlAllItems);
        clientContext.load(collListItems,'Include(SizeOfSite,FullUrl)');
        clientContext.executeQueryAsync(onQuerySucceeded2, onQueryFailed);

    }
    
    function onQuerySucceeded2(){
    	//var sub = webColl.get_count();
    // Colección de items de la lista Lista de Sitios
    	enumItems = collListItems.getEnumerator();
    	while (enumItems.moveNext()){
    		var item = enumItems.get_current();
    		var size = item.get_fieldValues().SizeOfSite;
    		var fullUrl = item.get_fieldValues().FullUrl;
    		// Validar Url
    		if(fullUrl != null && fullUrl !== 'undefined'){
    			var tempUrl = fullUrl.get_url();
    			var relUrl = tempUrl.substring(tempUrl.indexOf(".com")+4);
    			openSubSite(webColl, relUrl,size);
    			
    		}
    		
    	}
    	setTimeout(function(){
       		//console.log(objWebsFilter.Url);
       		for(var i = 0; i < objWebsColl.length; i++){ //recorrer el array devuelto de REST
       		//console.log(objWebsColl[i].Url + " - " + objWebsColl[i].Size );
       		var found_names = $.grep(objWebsCollFilter,function(v){
					if (v.Url.indexOf(objWebsColl[i].Url.toString())!= -1){
						tamanioFiltro += Number(v.Size);
						objWebsColl[i].Size = tamanioFiltro;
					}
					return found_names;
				});
       				//};
			}			
			
				//console.log(found_names);
		for( var e = 0; e < objWebsColl.length; e++){
			console.log("Url del sitio: "+ objWebsColl[e].Url + " - " + "Cuota actual: " + objWebsColl[e].Size /1073741824 + " Gb" );
			}
			//};	
			},10000);
    }
    
    // Función para acceder a cada subsitio y obtener la colección de listas
    function openSubSite(webs, url, sizeSite){
    		get_listsCollection(url, sizeSite);
    		
        } 
    
    
	function get_listsCollection(urlSite, sizeSite) { //peticion al servicio web que me devuelve el tamaño en bytes de cada lista o biblioteca que contenga un sitio
	    $.ajax({			/* IMPORTANTE!!!!!!!!!!!!!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! COMILLAS SIMPLES Y DOBLES EN ESTE ORDEN, SINO FALLA!!!!!!*/
	        url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/webs?$expand=Lists/RootFolder&$select=Lists/RootFolder/ServerRelativeURL&$filter=(substringof(\'" + urlSite + "\',RootFolder/ServerRelativeUrl))",
	        type: "GET", /* NO ES "METHOD" ES "TYPE"*/
	        headers: { "Accept": "application/json; odata = verbose" },
	        success: function (data) {
	        	if(data.d.results[0] != null && typeof data.d.results[0] !== 'undefined'){
		            var numberofLists = data.d.results[0].Lists.results.length;
		            //console.log(urlSite  + " - " + numberofLists);
		            get_listsSize(data.d.results[0].Lists.results,sizeSite,urlSite);
	            }
	            
	        },
	        error: function (sender, args) {
	            alert('Request failed. ' + args +
						'\n' + sender.responseJSON.error.message.value);
	        }
	    })
	}
    
    
    
    function get_listsSize(listsColl,sizeSite, webUrl) {
    	//se cargan los subsitios en el array
    		objWebs = {Url: webUrl, Size: tamanio};
       		objWebsColl.push(objWebs);
       		
        for (var x = 0; x < listsColl.length ; x++) {
	        var flag = false;
	        var olistUrl = listsColl[x].RootFolder.ServerRelativeUrl;
//	        var listUrl = oLists.get_defaultViewUrl();
	        
	        /*Si lo encuentra imprime desde la posicion 0 hasta antes de /Forms/*/
	        var catalogIndex = olistUrl.indexOf("/_catalogs");
	        if (catalogIndex == -1) {
	            flag = true;
	        }
	       /* else {
	              var listIndex = olistUrl.indexOf("/Lists/");
	              if (listIndex != -1) {
	                flag = true;
	         } 
        }*/
        if (flag) {
            var objList = {Indice: x, Url: olistUrl};
            objListColl.push(objList);
        }
      }
     		
       	
      	 
    	// Llamada a REST para obtener el tamaño de cada lista
    	//Reseteamos el valor de la variable
    	webtotalSize =0;
        for (var j = 0; j < objListColl.length; j++) {
            get_listSize(objListColl[j].Url,webUrl,j);
        };
        
             // Comparar tamaño de cuota con tamaño del sitio
            
       		
				
        //var currentSizeGb = 0; //webtotalSize/1073741824;
//        for(var i = 0; i < objWebsColl.length; i++)
        
        	
       	
       	//console.log(objWebsColl[0].Url);	        
    }
    
    
    function onFail(){
    
    }
            //alert('La url del sitio es: '+ objListColl[x].Url);
        
    
      /*  function retrieveSubsites(){ //devuelve el nombre de la url de los subsitios
        
        var enumerator = websColl.getEnumerator();
        while(enumerator.moveNext()){
        var subsite = enumerator.get_current();
        var objWebs = {Name: subsite.get_title(),Url:subsite.get_url(),Size: 0};
        objWebsColl.push(objWebs);
       }
    }*/
    
    //retrieveSubsites();
    
       function get_listSize(urlLista,urlSubsitio,indice) { //peticion al servicio web que me devuelve el tamaño en bytes de cada lista o biblioteca que contenga un sitio
       		//console.log('Url sitio: ' + urlSubsitio);
            $.ajax({			/* IMPORTANTE!!!!!!!!!!!!!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! COMILLAS SIMPLES Y DOBLES EN ESTE ORDEN, SINO FALLA!!!!!!*/
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/getFolderByServerRelativeUrl(\'" + urlLista + "\')?$select=StorageMetrics&$expand=StorageMetrics",
                type: "GET", /* NO ES "METHOD" ES "TYPE"*/
                headers: { "Accept": "application/json; odata = verbose" },
                success: function (data,urlSubsitio) {
                	//console.log  ('size: ' + data.d.StorageMetrics.TotalSize);
                    var totalSize = data.d.StorageMetrics.TotalSize;
                    webSizeforFilter = Number(totalSize);
                    objWebsFilter = {Url: urlLista, Size: webSizeforFilter};
                    objWebsCollFilter.push(objWebsFilter);
					//webtotalSize += Number(totalSize);
                  	//objWebsCollFilter[indice].Size = webSizeforFilter;
                    //objWebsCollFilter[indice].Url = urlLista;
                    //extraerValores(objWebsCollFilter, objWebsColl);                              
                    //console.log(objWebsFilter.Url + " - " + objWebsFilter.Size /1073741824 + " Gb" );
                    //console.log(objWebsCollFilter.length + " " + ); 
                    //console.log(urlLista + " - " +  data.d.StorageMetrics.TotalSize + " - " + objWebsColl[a].Url + " - " + objWebsColl[a].Size);
                    //console.log(urlSubsitio + " - "+ urlLista + " - " + data.d.StorageMetrics.TotalSize);
                    
                },
                error: function (sender, args) {
                    alert('Request failed. ' + args +
							'\n' + sender.responseJSON.error.message.value);
                }
            })
            
            
        }
       /*function extraerValores(arraySubsites, arrayLists){
            			for(var u=0; u<objWebsColl.length; u++){
                    	     if(objWebsFilter.Url.indexOf(objWebsColl[u].Url.toString()) != -1){
                    					tamanioFiltro += objWebsFilter.Size;
                    					objWebsColl[u].Size = tamanioFiltro;
                    				}
                    		} */             		
                       
    
    function onQueryFailed(sender,args) {
        console.log(args.get_message());
    }

});
