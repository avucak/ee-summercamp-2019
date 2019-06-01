document.getElementById("ucitaj").addEventListener("change",ucitajSliku);
document.getElementById("ucitajTajnu").addEventListener("change",ucitajTajnuSliku);

var slikaUcitana = false;
var tajnaSlikaUcitana = false;
var dobivenRezultat = false;
var ctx;
var ctxTajna;
var slika;
var tajnaSlika;

function ucitajSliku(e) {
  var reader = new FileReader();
  reader.onload = function(event) {
    var dataUrl = event.target.result;
    var img = new Image();
    img.onload = function() {
      var canvas = document.getElementById('canvas');
      ctx = canvas.getContext('2d');
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
    slika=img;
  };
  reader.readAsDataURL(e.target.files[0]);
  slikaUcitana=true;
}

function ucitajTajnuSliku(e) { //ista kao i ucitajSliku, ali dobavljamo drugi canvas
  var reader = new FileReader();
  reader.onload = function(event) {
    var dataUrl = event.target.result;
    var img = new Image();
    img.onload = function() {
      var canvas = document.getElementById('canvas2');
      ctxTajna = canvas.getContext('2d');
      ctxTajna.canvas.width = img.width;
      ctxTajna.canvas.height = img.height;
      ctxTajna.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
    tajnaSlika=img;
  };
  reader.readAsDataURL(e.target.files[0]);
  tajnaSlikaUcitana = true;
}

document.getElementById("sakrij").addEventListener("click",ispisi);
function ispisi()
{
if(slikaUcitana && tajnaSlikaUcitana)
  {
    //da slike budu iste veličine
    var cropWidth = Math.min(ctx.canvas.width,ctxTajna.canvas.width); //nova veličina je manja od dvije postojeće
    var cropHeight = Math.min(ctx.canvas.height,ctxTajna.canvas.height);
    ctx.canvas.width = cropWidth;
    ctx.canvas.height = cropHeight;
    ctx.drawImage(slika, 0, 0);
    slika.height=cropHeight;
    slika.width=cropWidth;

    ctxTajna.canvas.width = cropWidth;
    ctxTajna.canvas.height = cropHeight;
    ctxTajna.drawImage(tajnaSlika, 0, 0);
    tajnaSlika.height=cropHeight;
    tajnaSlika.width=cropWidth;

    var slikaColors=ctx.getImageData(0,0,cropWidth,cropHeight).data;
    var tajnaColors=ctxTajna.getImageData(0,0,cropWidth,cropHeight).data;
    var rezultat=ctx.getImageData(0,0,cropWidth,cropHeight);
    //prolazimo kroz bitove slike i mijenjamo ih tako da na zadnja 2 mjesta stavimo najznačajnije bitove tajne slike
    for(var i=0; i<slikaColors.length; i++)
    {
      let trenutniBitovi=slikaColors[i].toString(2); //toString(2) pretvara u binarni zapis
      trenutniBitovi="00000000".substring(0,8-trenutniBitovi.length)+trenutniBitovi; //da osiguramo da je duljine 8
      let noviBitovi=tajnaColors[i].toString(2);
      noviBitovi="00000000".substring(0,8-noviBitovi.length)+noviBitovi; //da osiguramo da je duljine 8
      noviBitovi=noviBitovi.substring(0,2); //uzememo prva 2, najznačanija, bita
      trenutniBitovi=trenutniBitovi.substring(0,6)+noviBitovi; //od 8 bitova sa slike uzimamo prvih 6 i dodajemo im prva 2 tajne slike
      rezultat.data[i]=parseInt(trenutniBitovi,2); //u data su brojevi zapisani dekadski 
    }
    nacrtaj(rezultat);
    dobivenRezultat=true;
  }
else
  window.alert("Niste ucitali slike!");
}

function nacrtaj(data)
{
  var canvas = document.getElementById('canvasRezultat');
  var ctxRez= canvas.getContext('2d');
  ctxRez.canvas.width = data.width;
  ctxRez.canvas.height =data.height;
  ctxRez.putImageData(data, 0, 0);
}

document.getElementById("otkrij").addEventListener("click",otkrijSliku);
function otkrijSliku()
{
  if(dobivenRezultat)
  {
    var ctxRez=document.getElementById('canvasRezultat').getContext('2d');
    var rezColors=ctxRez.getImageData(0,0,ctxRez.canvas.width,ctxRez.canvas.height).data;
    var tajna=ctxRez.getImageData(0,0,ctxRez.canvas.width,ctxRez.canvas.height);
    for(var i=0; i<rezColors.length; i++)
    {
      let skriveniBitovi=rezColors[i].toString(2);
      skriveniBitovi="00000000".substring(0,8-skriveniBitovi.length)+skriveniBitovi;
      skriveniBitovi=skriveniBitovi.substring(6,8); //uzimamo zadnja dva bita iz slike koju smo dobili skrivanjem
      tajna.data[i]=parseInt(skriveniBitovi+"000000",2); //stavimo ih kao prva dva bita (jer smo ih tako dobili)
      //dok za ostale postavimo nule
    }
    var canvas = document.getElementById('canvasOtkrij');
    var ctxOtkrij= canvas.getContext('2d');
    ctxOtkrij.canvas.width = ctxRez.canvas.width;
    ctxOtkrij.canvas.height =ctxRez.canvas.height;
    ctxOtkrij.putImageData(tajna, 0, 0);
  }
  else
  {
    window.alert("Prvo trebate sakriti sliku!");
  }
}