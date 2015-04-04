var userDataState = {};

Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
        
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});

// Extract the text from the template .html() is the jquery helper method for that
var raw_template = $('#question-template').html();
// Compile that into an handlebars template
var template = Handlebars.compile(raw_template);
// Retrieve the placeHolder where the Posts will be displayed 
var placeHolder = $("#questionsContainer");
// Generate the HTML for the template
var html = template(questionsData);
// Render the posts into the page
placeHolder.append(html);

$.each( questionsData.questions, function( index, question ) {
    $(".answers-"+index+"-container").dragend({
        afterInitialize: function() {
          this.container.style.visibility = "visible";
      },
      pageClass: 'answer',
      direction: 'horizontal',
      onSwipeEnd: function() {
          var first = this.pages[0],
          last = this.pages[this.pages.length - 1];

          $(".pagination-"+index+" > .page-prev, .pagination-"+index+" > .page-next").removeClass("disabled");
          $(".pagination-"+index+" li").removeClass("active");

          if (first === this.activeElement) {
            $(".pagination-"+index+" > .page-prev").addClass("disabled");
        };

        if (last === this.activeElement) {
            $(".pagination-"+index+" > .page-next").addClass("disabled");
        }

        $(".pagination-"+index+" li").eq(this.page+1).addClass("active");
        
        // Set chosen answer
        userDataState.questions[index].chosenAnswer=this.page;

        }
    });

    $(".pagination-"+index+" > .page-prev").click(function() {
        $(".answers-"+index+"-container").dragend("right");
    });

    $(".pagination-"+index+" > .page-next").click(function() {
        $(".answers-"+index+"-container").dragend("left");
    });

    $(".pagination-"+index).click(function(e) {
        e.preventDefault();
        var page = $(event.target).data("page");
        $(".answers-"+index+"-container").dragend({
          scrollToPage: page
      });

        $(event.target).addClass("active");

    });
});

function constructBody(forClipboard) {
  var nLine = "\r\n";
  if(!forClipboard) {
    nLine = "%0D%0A";
  }
  var response = "To TRAI, "+nLine+"From a concerned citizen."+nLine+nLine;
  for (var i = 0; i < questionsData['questions'].length; i++) {
    var question = (i+1)+") "+questionsData['questions'][i]['questionText'];
    
    var chosenAnswer = userDataState.questions[i].chosenAnswer;
    var answer = questionsData['questions'][i]['answers'][chosenAnswer]['answerText'];

    response = response + question + ""+nLine+"" +answer+""+nLine+""+nLine+"";
  };
  response = response + "Regards,"+nLine+nLine;
  return response;
}


var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
}
var toAddress = "advqos@trai.gov.in";
var bccAddress = "responses@netneutrality.in";
var subject = "In response to the Consultation Paper on Regulatory Framework for Over-the-top (OTT) services";

$("#send").click(function(e) {
  if(isMobile) {
    e.preventDefault();
    window.location = "mailto:"+toAddress+"?subject="+subject+"&bcc="+bccAddress+"&body="+constructBody();
  }
});


function initState() {
  $(".page-prev").addClass("disabled");
  $( ".pagination li:nth-child(2)" ).addClass("active");
  var questions = [];
  for (var i = questionsData['questions'].length - 1; i >= 0; i--) {
    questions.push({
      chosenAnswer:0,
      answersLength:questionsData['questions'][i]['answers'].length
    });
  }
  userDataState = {
    questions: questions
  };
  if(!isMobile) {
    setTimeout(function() {
    //set path
    ZeroClipboard.setMoviePath('swf/ZeroClipboard.swf');
    //create client
    var clip = new ZeroClipboard.Client();
    //event
    clip.addEventListener('mousedown',function() {
      clip.setText(constructBody(forClipboard=true));
    });
    clip.addEventListener('complete',function(client,text) {
      alert('Your response has been copied to your clipboard. Please paste it in the body of your email once Gmail opens.');
      window.location = "https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&source=mailto&to="+toAddress+"&bcc="+bccAddress+"&su="+subject;
    });
    //glue it to the button
    clip.glue("send");
    });
  }
}

initState();