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
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    video.srcObject = stream;
  });

  click_button.addEventListener('click', function() {
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
  });

  var download = function() {
    $('#click-photo').trigger('click');
    setTimeout(() => {
      var link = document.createElement('a');
      link.download = tmpImage;
      link.href = document.getElementById('canvas').toDataURL()
      link.click();
    }, 1000);
  }

  function clear() {
    $("#process").text("");
    $("#calculate-rating").prop("disabled", false);
    $("#loading").css("display", "none");
    $(document.body).removeClass('make_darkness');
  }




  $('#detect-face').click(() => {
    var startTime = new Date();
    $('#result').html('');
    $(document.body).addClass('make_darkness');
    $("#loading").css("display", "inline");
    $("#process").text("Please Wait!")
    $.ajax({
      url: '/deleteImages',
      type: 'GET',
      data: {
        filePath: downloadedImagePath
      },
      success: (data) => {
        download();
        setTimeout(() => {
          $.ajax({
            url: '/detectFace',
            type: 'GET',
            data: {
              imgFilePath: downloadedImagePath
            },
            success: (data) => {
              var finishTime = new Date();
              const diffInMilliseconds = Math.abs(finishTime - startTime);
              const runtime = diffInMilliseconds / 1000;
              alert(`Runtime is : ${runtime} seconds`);
              if (data.length == 0) {
                alert("Undetected Face...");
                clear();
                return;
              }

              for (var i = 0; i < data.length; i++) {
                $('#result').append(`<p>Detected Face ${i+1}</p><img src='${data[i]}' style="border:solid 1px green;"></img>`);
              }

              console.dir(data);


            },
            error: function(xhr, status, error) {
              // Handle error
              clear();
              alert('An error occurred: ' + xhr.responseText);
            }
          }).done((data) => {
            clear();
          });
        }, 1000);
      }
    });
  });

  $('#get-detect-face').click(() => {
    $('#result').html('');
    $(document.body).addClass('make_darkness');
    $("#loading").css("display", "inline");
    $("#process").text("Please Wait!");

    $.ajax({
      url: '/getDetectedData',
      type: 'GET',
      success: (data) => {
        if (data === "No result data") {
          alert(data);
          return;
        }
        $('#result').html(data);
        let table = new DataTable('#face-detect-table', {
          responsive: true,
          dom: 'Bfrtip',
          buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
          ],
          columnDefs: [{
              targets: 'id',
              orderable: true
            },
            // Enable sorting for the "id" column
          ],
          order: [
            [0, 'desc']
          ]
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

  $('#search-face').click(() => {
    var startTime = new Date();
    $('#result').html('');
    $(document.body).addClass('make_darkness');
    $("#loading").css("display", "inline");
    $("#process").text("Please Wait!")
    $.ajax({
      url: '/deleteImages',
      type: 'GET',
      data: {
        filePath: downloadedImagePath
      },
      success: (data) => {
        download();
        setTimeout(() => {
          /*$.ajax({
            url: '/isDetectFace',
            type: 'GET',
            data: {
              imgFilePath: downloadedImagePath
            },
            success: (data) => {
              if (!data) {
                alert("Undetected Face...");
                clear();
                return;
              }*/
              $.ajax({
                url: '/matchFaceDesc',
                type: 'GET',
                data: {
                  imgFilePath: downloadedImagePath
                },
                success: (data) => {
                  var finishTime = new Date();
                  const diffInMilliseconds = Math.abs(finishTime - startTime);
                  const runtime = diffInMilliseconds / 1000;
                  alert(`Runtime is : ${runtime} seconds`);
                  if (data === "No result data") {
                    alert(data);
                    return;
                  } else {
                    $('#result').html(data);
                    let table = new DataTable('#matched-face-table', {
                      responsive: true,
                      dom: 'Bfrtip',
                      buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                      ],
                    });
                  }
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
            /*},
            error: function(xhr, status, error) {
              // Handle error
              clear();
              alert('An error occurred: ' + xhr.responseText);
            }
          });.done((data) => {

          });*/
        }, 1000);
      }
    });
  });