$(document).ready(function () { //importante aÃ±adir libreria jquery 
var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;
alert(inDesignMode);
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', retrieveWebSiteProperties);
    var objListColl = [];
    var objFieldsColl = [];
    var objFields;
    var inDesignMode;
    var oLoader;
    var enumItems;
    var cuotaFields = 0;
    var cuotaWebstoFields = 0;
    var clientContext;
    var itemCreateInfo;
    var oListItem = [];
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
    var oLista = [];
    var objWebsColl = [];
    var collListItems =[];
    var collListaItems = [];
    var urlRelativa;
      function retrieveWebSiteProperties() {
      	alert(inDesignMode);
		    if(inDesignMode !== "1")
		    {      
		    	alert("browse");
		        clientContext = SP.ClientContext.get_current();
		        oLoader = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);
		        var rootWeb = clientContext.get_web();
		        webColl = rootWeb.get_webs();
		        var oList = rootWeb.get_lists().getByTitle('Lista de sitios');  
		        // clientContext.get_web().get_lists().getByTitle('Lista de sitios');
		        //itemCreateInfo = new SP.ListItemCreationInformation();
		        //var oLista =  rootWeb.get_lists().getByTitle('Cuotas');
		        //oListItems = oLista.addItem(itemCreateInfo);
		   	    //var camlQuery = new SP.CamlQuery();
		        var camlAllItems = SP.CamlQuery.createAllItemsQuery();
		        //var camlAllItems2 = SP.CamlQuery.createAllItemsQuery();
		        //camlQuery.set_viewXml('<View><Query><Where><Contains><FieldRef Name=\'FullUrl\'/>'+ '<Value Type= \'URL\'>/sites/aletas/admin/</Value></Contains></Where></Query></View>');
		        clientContext.load(rootWeb);
		        clientContext.load(webColl);
		        collListItems = oList.getItems(camlAllItems);
		        //collListaItems = oLista.getItems(camlAllItems2);
		        clientContext.load(collListItems,'Include(SizeOfSite,FullUrl,Title,Author)');
		        //clientContext.load(collListaItems, 'Include(Title,Cuota,Tamano,Propietario)');
		        clientContext.executeQueryAsync(onQuerySucceeded2, onQueryFailed);
		    }
		    else {
		    	alert("design");
		    }
	
	    }
	    
	    function onQuerySucceeded2(){
	    	//var sub = webColl.get_count();
	    // ColecciÃ³n de items de la lista Lista de Sitios
	   // else{
	    
	    	enumItems = collListItems.getEnumerator();
	    	while (enumItems.moveNext()){
	    		var item = enumItems.get_current();
	    		var size = item.get_fieldValues().SizeOfSite;
	    		var fullUrl = item.get_fieldValues().FullUrl;
	    		var fieldTitle = item.get_fieldValues().Title.toString();
	    		//var fieldUser = item.get_fieldValues().Author.toString();
	    		
	
	    		// Validar Url
	    		if(fullUrl != null && fullUrl !== 'undefined'){
	    			var tempUrl = fullUrl.get_url();
	    			var relUrl = tempUrl.substring(tempUrl.indexOf(".com")+4);
	    			openSubSite(webColl, relUrl,size);
	    			
	    		}
	    		objFields = {Title: fieldTitle, Size: size, User: item.get_fieldValues().Author, Url: item.get_fieldValues().FullUrl, Cuota: cuotaFields};
	            objFieldsColl.push(objFields);
	    		
	    	//};
	    	
	    		/*for(var q = 0; q < objFieldsColl.length; q++){
	    				console.log(objFieldsColl[q].Title + " - " + objFieldsColl[q].Size + " - " + objFieldsColl[q].User.$5_2 + " - " + objFieldsColl[q].Url);
	     		} */
	     		
	    	setTimeout(function(){
	       		//console.log(objWebsFilter.Url);
	       		for(var i = 0; i < objWebsColl.length; i++){ //recorrer el array devuelto de REST
	       			 var found_names = $.grep(objWebsCollFilter,function(v){
						if (v.Url.indexOf(objWebsColl[i].Url.toString())!= -1){
							tamanioFiltro += Number(v.Size);
							objWebsColl[i].Size = tamanioFiltro/1073741824;
							tamanioFiltro = 0;
						}
						return found_names;
					});
	       				
				}
				for(var p = 0; p < objWebsColl.length; p++){ //recorrer el array devuelto de REST
	       			 var found_cuotas = $.grep(objFieldsColl,function(){
						if (objFieldsColl[p].Url.$1_1 != null && typeof objFieldsColl[p].Url.$1_1 !== 'undefined' && objFieldsColl[p].Url.$1_1.indexOf(objWebsColl[p].Url.toString())!= -1){
							cuotaWebstoFields = Number(objWebsColl[p].Size); 
							objFieldsColl[p].Cuota = cuotaWebstoFields;
							cuotaWebstoFields = 0;
						}
						return found_cuotas;
					});
	       				
				}				
				
				for(var e = 0; e < objWebsColl.length; e++){
				//console.log("Url del sitio: "+ objWebsColl[e].Url + " - " + "Cuota actual: " + objWebsColl[e].Size + " Gb" );
				//console.log(objFieldsColl[e].Title + " - " + objFieldsColl[e].Size + " - " + objFieldsColl[e].User.$5_2 + " - " + objFieldsColl[e].Cuota);
				getUserbyId(e,objWebsColl,objFieldsColl);
				oLoader.close();
				}
				/*for( var z=0; z< objFieldsColl.length; z++){
					console.log(objFieldsColl[z].Title + " - " + objFieldsColl[z].Cuota);
					
				}*/
				},10000);
				
			}	
				
	    }
	    
	    // FunciÃ³n para acceder a cada subsitio y obtener la colecciÃ³n de listas
	    function openSubSite(webs, url, sizeSite){
	    		get_listsCollection(url, sizeSite);
	    		
	        } 
	    
	    
		function get_listsCollection(urlSite, sizeSite) { //peticion al servicio web que me devuelve el tamaÃ±o en bytes de cada lista o biblioteca que contenga un sitio
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
			        
		        /*Si lo encuentra imprime desde la posicion 0 hasta antes de /Forms/*/
		        var catalogIndex = olistUrl.indexOf("/_catalogs");
		        if (catalogIndex == -1) {
		            flag = true;
		        }
		       
		       	if (flag) {
	            var objList = {Indice: x, Url: olistUrl};
	            objListColl.push(objList);
	        }
	      }
	     		
	       	
	      	 
	    	// Llamada a REST para obtener el tamaÃ±o de cada lista
	    	//Reseteamos el valor de la variable
	    	webtotalSize =0;
	        for (var j = 0; j < objListColl.length; j++) {
	            get_listSize(objListColl[j].Url,webUrl,j);
	        };
	        
	             // Comparar tamaÃ±o de cuota con tamaÃ±o del sitio
		        
	    }
	    
	    
	    function onFail(){
	    
	    }
	            		    
	       function get_listSize(urlLista,urlSubsitio,indice) { //peticion al servicio web que me devuelve el tamaÃ±o en bytes de cada lista o biblioteca que contenga un sitio
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
								                    
	                },
	                error: function (sender, args) {
	                    alert('Request failed. ' + args +
								'\n' + sender.responseJSON.error.message.value);
	                }
	            })
	            
	            
	        }
	    		    	
				    				
	function getUserbyId(indice,objWebsColl,objFieldsColl) {
	  clientContext = new SP.ClientContext.get_current();
	  var user = clientContext.get_web().getUserById(objFieldsColl[0].User.$1g_1); // e.g. user id = 30
  	  clientContext.load(user);
  	
  	clientContext.executeQueryAsync( 
    function () {
      // now you have the user id and correct login name, update author
      var userField = user.get_id() + ";#" + user.get_loginName();
      updateUser(userField,indice,objWebsColl,objFieldsColl);
     },
     function (sender, args) {
      // console.log('Error retrieving user properties');
     }
  );
}
	
	function updateUser(userField, indice,objWebsColl, objFieldsColl) {
	  clientContext = new SP.ClientContext.get_current();
	  oLista = clientContext.get_web().get_lists().getByTitle('Cuotas');
	  oListItem = oLista.addItem(new SP.ListItemCreationInformation());
	 					
	    	oListItem.set_item('Title', objFieldsColl[indice].Title);
	    	oListItem.set_item('Cuota', objFieldsColl[indice].Cuota);
			oListItem.set_item('Tamano',Number(objFieldsColl[indice].Size));
			oListItem.set_item("Propietario", userField);
			
			oListItem.update();

	    
	 	clientContext.load(oListItem);           
	
	  clientContext.executeQueryAsync( 
	    function (sender, args) {
	     // console.log('se ha aÃ±adido el usuario correctamente');
	    }, 
	    function (sender, args) {
	      //console.log('no se ha podido aÃ±adir el usuario');                  
	    }
	  );

}
	
		    function onQueryFailed(sender,args) {
	      //  console.log(args.get_message());
	    }
	    
	    
	
	});
	


