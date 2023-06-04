  let camera_button = document.querySelector("#start-camera");
  let video = document.querySelector("#video");
  let click_button = document.querySelector("#click-photo");
  let canvas = document.querySelector("#canvas");
  const tmpImage = 'tmpImage.png';
  const downloadedImagePath = `C:/Users/mehfatitem/Downloads/${tmpImage}`;

  $(document).ready(() => {
      $('#start-camera').trigger('click');
  });

  camera_button.addEventListener('click', async function() {
      let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = stream;
  });

  click_button.addEventListener('click', function() {
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      let image_data_url = canvas.toDataURL('image/jpeg');
  });

  var download = function(){
    $('#click-photo').trigger('click');
     setTimeout(() => { 
      var link = document.createElement('a');
      link.download = tmpImage;
      link.href = document.getElementById('canvas').toDataURL()
      link.click();
     } , 1000);
  }

  function clear() {
    $("#process").text("");
    $("#calculate-rating").prop("disabled" , false);
    $("#loading").css("display" , "none");
    $(document.body).removeClass('make_darkness');
  }




    $('#detect-face').click(() => {
      $('#result').html('');
      $(document.body).addClass('make_darkness');
      $("#loading").css("display" , "inline");
      $("#process").text("Please Wait!")
      $.ajax({
              url: '/deleteImages',
              type: 'GET',
              data : {filePath : downloadedImagePath },
              success: (data) => {
                      download();
                      setTimeout(() => { 
                      $.ajax({
                              url: '/detectFace',
                              type: 'GET',
                              data: {imgFilePath : downloadedImagePath},
                              success: (data) => {
                                  if(data.length == 0)
                                      alert("Undetected Face...");
                                  $('#result').html(`<p>Detected Face</p><img src='${data}' style="border:solid 1px green;"></img>`);
                              },  error: function(xhr, status, error) {
                                  // Handle error
                                  clear();
                                  alert('An error occurred: ' + xhr.responseText);
                              }
                          }).done((data) => {
                            clear();
                          });
                      } , 1000);
              }
      });
    });

    $('#get-detect-face').click(() => {
      $('#result').html('');
      $(document.body).addClass('make_darkness');
      $("#loading").css("display" , "inline");
      $("#process").text("Please Wait!")
        $.ajax({
          url: '/getDetectedData',
          type: 'GET',
          success: (data) => {
            $('#result').html(data);
            let table = new DataTable('#face-detect-table', {
              responsive: true,
              columnDefs: [
                { targets: 'id', orderable: true } // Enable sorting for the "id" column
              ],
              order: [[0, 'desc']] 
            });
            clear();
          },
          error: function(xhr, status, error) {
            // Handle error
            clear();
            alert('An error occurred: ' + xhr.responseText);
          }
        }).done(function(data) {
          clear();
        });
    });
