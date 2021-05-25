import '../css/mycss.less';
import 'datatables.net-dt/css/jquery.dataTables.css';

import 'datatables.net';
import $ from 'jquery';

import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/toast';

//import './event.js';

import {generateUrl} from "@nextcloud/router";

var baseUrl = generateUrl('/apps/gestion');

const euro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

$(window).on("load", function(){
    $("#liveToast").toast({animation: true, delay: 4000});

    //DEVISSHOW.PHP
    if($('#devisid').length){
        console.log($('#devisid').data('id'))
        getClientByIdDevis($('#devisid').data('id'));
        getProduitsById();
    }

    //INDEX.PHP
    if($('#client').length){
        loadClientDT();
    }


    if($('#devis').length){
        loadDevisDT();
    }
    if($('#facture').length){
        loadFactureDT();
    }
    if($('#produit').length){
        loadProduitDT();
    }

});

$('body').on('click', '.menu', function(){
    $('#menu-'+this.dataset.menu).toggleClass('open');
});

$('body').on('click', '.editable', function(){
    $(this).attr('contenteditable', 'true');
});

$('body').on('blur', '.editable', function(){
    updateDB($(this).data('table'), $(this).data('column'), $(this).text(), $(this).data('id'));
    if($(this).data('modifier') === "getProduitsById"){
        getProduitsById();
    }
    $(this).attr('contenteditable', 'false');
    $(this).removeAttr('contenteditable');
});

$('body').on('dblclick', '.selectableClient, .selectableClient_devis', function(){
    var id = $(this).data('id');
    var table = $(this).data('table');
    var column = $(this).data('column');
    $(this).text("");
    $(this).html('<select id="listClient">');
    listClient($('#listClient'), id, table, column);
});

$('body').on('dblclick', '.selectableDevis', function(){
    var id = $(this).data('id');
    var table = $(this).data('table');
    var column = $(this).data('column');
    $(this).text("");
    $(this).html('<select id="listDevis">');
    listDevis($('#listDevis'), id, table, column);
});

$('body').on('dblclick', '.selectable', function(){
    var id = $(this).data('id');
    $(this).text("");
    $(this).html('<select id="listProduit">');
    listProduit($('#listProduit'), id);
});

$('body').on('click', '.deleteItem', function(){
    var id = $(this).data('id');
    var table = $(this).data('table');
    var modifier = $(this).data('modifier');

    deleteDB(table, id);

    if( modifier === "getProduitsById"){
        getProduitsById();
    }

    if( modifier === "client"){
        loadClientDT();
    }

    if( modifier === "devis"){
        loadDevisDT();
    }

    if( modifier === "facture"){
        loadFactureDT();
    }

    if( modifier === "produit"){
        loadProduitDT();
    }
});

$('body').on('click', '#listClient,#listProduit,#listDevis', function(){

    //Récupère les variables
    var id=$(this).find(':selected').data('id')
    var val=$(this).find(':selected').data('val')
    var column=$(this).find(':selected').data('column')
    var table=$(this).find(':selected').data('table')
    var el = $(this).parent();

    updateDB(table, column, val, id);

    if( el.get( 0 ).className === "selectableClient_devis"){
        getClientByIdDevis(id);
    }if($(this).attr('id')==="listProduit"){
        getProduitsById();
    }

    el.text($(this).val());

});

$('body').on('click', '#devisAdd', function(){
    var devis_id = $('#devisid').data('id');
    var produit_devis = {
        id: devis_id
    };
    
    $.ajax({
        url: baseUrl + '/insertProduitDevis',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(produit_devis)
    }).done(function (response) {
        getProduitsById();
    }).fail(function (response, code) {
        error(response);
    });
});

$('body').on('click', '#newDevis', function(){
    newDevis();
    loadDevisDT();
})

$('body').on('click', '#newClient', function(){
    newClient();
    loadClientDT();
})

$('body').on('click', '#newFacture', function(){
    newFacture();
    loadFactureDT();
})

$('body').on('click', '#newProduit', function(){
    newProduit();
    loadProduitDT();
})

function loadProduitDT(){
    if(! $.fn.DataTable.isDataTable( '#produit' )){
        $('#produit').dataTable({
            "autoWidth": true,
            "columns": [
                { "width": "10%" },
                { "width": "20%" },
                { "width": "50%" },
                { "width": "20%" },
              ]
          } );
    }

    $.ajax({
        url: baseUrl+'/getProduits',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        $('#produit').DataTable().clear();
        $.each(JSON.parse(response), function(arrayID, myresp) {
           $('#produit').DataTable().row.add([
                '<div data-modifier="produit" data-id=' + myresp.id + ' data-table="produit" style="display:inline-block;margin-right:0px;" class="deleteItem icon-delete"></div>' +myresp.id,
               '<div class="editable" data-table="produit" data-column="reference" data-id="'+myresp.id+'">'+ myresp.reference+'</div>',
               '<div class="editable" data-table="produit" data-column="description" data-id="'+myresp.id+'">'+myresp.description+'</div>',
               '<div class="editable" data-table="produit" data-column="prix_unitaire" data-id="'+myresp.id+'">'+myresp.prix_unitaire+'</div>'
            ]);
        });
        $('#produit').DataTable().draw(false);
    }).fail(function (response, code) {
        console.log(code);
    });
}

function loadFactureDT(){
    if(! $.fn.DataTable.isDataTable( '#facture' )){
        $('#facture').dataTable({
            "autoWidth": true,
            "columns": [
                { "width": "10%" },
                { "width": "16%" },
                { "width": "16%" },
                { "width": "17%" }, 
                { "width": "18%" },
                { "width": "23%" }
              ]
          } );
    }

    $.ajax({
        url: baseUrl+'/getFactures',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        $('#facture').DataTable().clear();
        $.each(JSON.parse(response), function(arrayID, myresp) {
            var dtpaiement=""
            if(myresp.date_paiement==null){
                dtpaiement="Attente client"
            }else{
                dtpaiement=myresp.date_paiement
            }

           $('#facture').DataTable().row.add([
                                                '<div data-modifier="facture" data-id=' + myresp.id + ' data-table="facture" style="display:inline-block;margin-right:0px;" class="deleteItem icon-delete"></div><div style="display:inline-block;margin-right:0px;width:80%;"><a href="/apps/gestion/facture/'+myresp.id+'/show"><i class="icon-details style="display:inline-block;margin-right:0px;">      </i><div style="display:inline-block;margin-right:0px;width:65%;text-align:right;">'+myresp.id+'</div></a></div>',
                                                '<div class="editable" data-table="facture" data-column="num" data-id="'+myresp.id+'">'+myresp.num+'</div>',
                                                '<div class="editable" data-table="facture" data-column="date" data-id="'+myresp.id+'">'+myresp.date+'</div>',
                                                '<div class="editable" data-table="facture" data-column="date_paiement" data-id="'+myresp.id+'">'+dtpaiement+'</div>',
                                                '<div class="editable" data-table="facture" data-column="type_paiement" data-id="'+myresp.id+'">'+myresp.type_paiement+'</div>',
                                                '<div class="selectableDevis" data-table="facture" data-column="id_devis" data-id="'+myresp.id+'">'+myresp.dnum + ' ' + myresp.prenom + " " + myresp.nom + ' - ' + myresp.entreprise + '</div>'
                                            ]);
        });
        $('#facture').DataTable().draw(false);
    }).fail(function (response, code) {
        console.log(code);
    });
}

function loadDevisDT(){
    if(! $.fn.DataTable.isDataTable( '#devis' )){
        $('#devis').dataTable({
            "autoWidth": true,
            "columns": [
                { "width": "10%" },
                { "width": "30%" },
                { "width": "30%" },
                { "width": "30%" }
              ]
          } );
    }

    $.ajax({
        url: baseUrl+'/getDevis',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        $('#devis').DataTable().clear();
        $.each(JSON.parse(response), function(arrayID, myresp) {
           $('#devis').DataTable().row.add([
                                        '<div data-modifier="devis" data-id=' + myresp.id + ' data-table="devis" style="display:inline-block;margin-right:0px;" class="deleteItem icon-delete"></div><div style="display:inline-block;margin-right:0px;width:80%;"><a href="/apps/gestion/devis/'+myresp.id+'/show"><i class="icon-details style="display:inline-block;margin-right:0px;">      </i><div style="display:inline-block;margin-right:0px;width:65%;text-align:right;">'+myresp.id+'</div></a></div>',
                                        '<div class="editable" data-table="devis" data-column="date" data-id="'+myresp.id+'">'+myresp.date+'</div>',
                                        '<a href="/apps/gestion/devis/'+myresp.id+'/show"></a>'+'<div style="display:inline" class="editable" data-table="devis" data-column="num" data-id="'+myresp.id+'">'+myresp.num+'</div>',
                                        '<div class="selectableClient" data-table="devis" data-column="id_client" data-id="'+myresp.id+'">'+myresp.prenom + " " + myresp.nom +'</div>'
                                    ]);
        });
        $('#devis').DataTable().draw(false);
    }).fail(function (response, code){
        console.log(code);
    });
}

function loadClientDT(){
    $.ajax({
        url: baseUrl+'/getClients',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        if(! $.fn.DataTable.isDataTable( '#client' )){
            $('#client').dataTable({
                "autoWidth": true,
                "columns": [
                    { "width": "6%" },
                    { "width": "14%" },
                    { "width": "10%" },
                    { "width": "10%" },
                    { "width": "10%" },
                    { "width": "14%" },
                    { "width": "18%" },
                    { "width": "18%" }
                  ]
              } );
        }
        
        $('#client').DataTable().clear();
        $.each(JSON.parse(response), function(arrayID, myresp) {
            $('#client').DataTable().row.add(['<div data-modifier="client" data-id=' + myresp.id + ' data-table="client" style="display:inline-block;margin-right:0px;" class="deleteItem icon-delete"></div>' + myresp.id,
                                                '<div class="editable" data-table="client" data-column="entreprise" data-id="'+myresp.id+'">'+myresp.entreprise+'</div>',
                                                '<div class="editable" data-table="client" data-column="nom" data-id="'+myresp.id+'">'+myresp.nom+'</div>',
                                                '<div class="editable" data-table="client" data-column="prenom" data-id="'+myresp.id+'">'+myresp.prenom+'</div>',
                                                '<div class="editable" data-table="client" data-column="siret" data-id="'+myresp.id+'">'+myresp.siret+'</div>',
                                                '<div class="editable" data-table="client" data-column="telephone" data-id="'+myresp.id+'">'+myresp.telephone+'</div>',
                                                '<div class="editable" data-table="client" data-column="mail" data-id="'+myresp.id+'">'+myresp.mail+'</div>',
                                                '<div class="editable" data-table="client" data-column="adresse" data-id="'+myresp.id+'">'+myresp.adresse+'</div>']);
        });
        
        $('#client').DataTable().draw();

    }).fail(function (response, code) {
        console.log(code);
    });
}

function getClientByIdDevis(id){
    var myData = {id: id,};
    $.ajax({
        url: baseUrl+'/clientbyiddevis',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(myData)
    }).done(function (response, code) {
        $.each(JSON.parse(response), function(arrayID, myresp) {
            $("#nomprenom").text(myresp.prenom + ' ' + myresp.nom);
            $("#nomprenom").attr('data-id', id);
            $("#entreprise").text(myresp.entreprise);
            $("#adresse").text(myresp.adresse);
            $("#mail").text(myresp.mail);
            $("#telephone").text(myresp.telephone);
            $("#siret").text(myresp.siret);
        });
    }).fail(function (response, code) {
        console.log(code);
    });
}


function listClient(lc, id, table, column){
    $.ajax({
        url: baseUrl+'/getClients',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        $.each(JSON.parse(response), function(arrayID, myresp) {
            lc.append('<option data-table="'+table+'" data-column="'+column+'" data-val="'+myresp.id+'" data-id="'+ id +'">'+myresp.prenom + ' ' + myresp.nom + ' ' + '</option>');
        });
    }).fail(function (response, code) {
        console.log(code);
    });
}

function listProduit(lp, id){
    $.ajax({
        url: baseUrl+'/getProduits',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        $.each(JSON.parse(response), function(arrayID, myresp) {
            lp.append('<option data-table="produit_devis" data-column="produit_id" data-val="'+myresp.id+'" data-id="' + id +'">'+myresp.reference + ' ' + myresp.description + ' ' + myresp.prix_unitaire + ' &euro;' + '</option>');
        });
    }).fail(function (response, code) {
    });
}

function listDevis(lp, id, table, column){
    $.ajax({
        url: baseUrl+'/getDevis',
        type: 'PROPFIND',
        contentType: 'application/json'
    }).done(function (response) {
        $.each(JSON.parse(response), function(arrayID, myresp) {
            lp.append('<option data-table="'+table+'" data-column="'+column+'" data-val="'+myresp.id+'" data-id="'+ id +'">'+myresp.num + ' ' + myresp.prenom + ' ' + myresp.nom + '</option>');
        });
    }).fail(function (response, code) {
    });
}

function updateDB(table, column, data, id){
    var myData = {
        table: table,
        column: column,
        data: data,
        id: id,
    };

    $.ajax({
        url: baseUrl+'/update',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(myData)
    }).done(function (response, code) {
        $("#liveToast").toast('show');
    }).fail(function (response, code) {
        console.log(code);
    });
}

function deleteDB(table, id){
    var myData = {
        table: table,
        id: id,
    };

    $.ajax({
        url: baseUrl+'/delete',
        type: 'DELETE',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(myData)
    }).done(function (response, code) {
        $("#liveToast").toast('show');
    }).fail(function (response, code) {
        console.log(code);
    });
}

function getProduitsById(){
    var devis_id = $('#devisid').data('id');
    var myData = {numdevis: devis_id,};

    $.ajax({
        url: baseUrl+'/getProduitsById',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(myData)
    }).done(function (response, code) {
        $('#produits tbody').empty();
        var total=0;
        $.each(JSON.parse(response), function(arrayID, myresp) {
            $('#produits tbody').append('<tr><td><div data-html2canvas-ignore data-modifier="getProduitsById" data-id="' + myresp.pdid + '" data-table="produit_devis" class="deleteItem icon-delete"></div><div style="display:inline;" data-id="' + myresp.pdid + '" class="selectable">' + myresp.reference + '</div></td>'+
                                        '<td>'+myresp.description+'</td>'+
                                        '<td><div class="editable getProduitsById" style="display:inline;" data-modifier="getProduitsById" data-table="produit_devis" data-column="quantite" data-id='+myresp.pdid+'>'+myresp.quantite+'</div> </td>'+
                                        '<td>'+euro.format(myresp.prix_unitaire)+'</td>'+
                                        '<td>'+euro.format((myresp.quantite*myresp.prix_unitaire))+'</td></tr>');
            total+=(myresp.quantite*myresp.prix_unitaire);
        });

        $("#totaldevis tbody").empty();
        $('#totaldevis tbody').append('<tr><td>'+euro.format(total)+'</td><td>20 %</td><td>'+euro.format(Math.round((total*0.2*100))/100)+'</td><td>'+euro.format(Math.round((total*1.2*100))/100)+'</td></tr>');
    }).fail(function (response, code) {
        console.log(code);
    });
}

function newFacture(){
    $.ajax({
        url: baseUrl+'/facture/insert',
        type: 'POST',
        async: false,
        contentType: 'application/json'
    }).fail(function (response, code) {
        console.log(code);
    });
}

function newDevis(){
    $.ajax({
        url: baseUrl+'/devis/insert',
        type: 'POST',
        async: false,
        contentType: 'application/json'
    }).fail(function (response, code) {
        console.log(code);
    });
}

function newClient(){
    $.ajax({
        url: baseUrl + '/client/insert',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        //data: JSON.stringify(client)
    }).fail(function (response, code) {
        error(response);
    });
}

function newProduit(){
    $.ajax({
        url: baseUrl + '/produit/insert',
        type: 'POST',
        async: false,
        contentType: 'application/json',
    }).fail(function (response, code) {
        error(response);
    });
}
