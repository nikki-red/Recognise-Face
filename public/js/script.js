//Loading the models
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);

//Just an alert to know when page is loaded
function start() {
  document.body.append('Page Loaded ...');
  recogFace();
};

const labels = titles.split(",");

async function recogFace() {
  const frame = document.querySelector('.container');
  const input = document.querySelector('#myImg');
  const file = document.getElementById('file');
  const container = document.createElement('div');
  const names = document.querySelector('.names');
  const text = document.createTextNode('');
  names.append(text);
  var ul = document.getElementById("list");
  container.style.position = 'relative';
  frame.append(container);

  const labeledDescriptors = await Promise.all(
    labels.map(async (label)=>{
        const img = await faceapi.fetchImage(`../uploaded_images/${label}`)
        const faceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        const faceDescriptors = [faceDescription.descriptor]
        return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
    })
  );

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)

  file.addEventListener('change', async () => {
    var image
    var canvas
    //Clearing 
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(file.files[0])
    input.src = image.src;
    container.append(input)
    canvas = faceapi.createCanvasFromMedia(input)
    container.append(canvas)
    faceapi.matchDimensions(canvas, { width: input.width, height: input.height })

    //Detecting all the faces
    const faces = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors()
    const resizedfaces = faceapi.resizeResults(faces,{ width: input.width, height: input.height })
    const results = resizedfaces.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor)
    });

    //Truncating the labels to get desired form of name
    var arrayLength = results.length;
    const res = [];
    for (var i = 0; i < arrayLength; i++) {
      const myArray = results[i].toString().split(".");
      res[i] = myArray[0];
    };
    arrayLength = res.length;
    for (var i = 0; i < arrayLength; i++) {
      const myArray = res[i].split(" (");
      results[i] = myArray[0];
    };

    results.forEach( (result, i) => {
      if(results[i].toString() !== 'unknown'){
        var li = document.createElement("li");
         li.appendChild(document.createTextNode(results[i].toString()));
         ul.appendChild(li);
        const box = resizedfaces[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        drawBox.draw(canvas)
      };
    });
  });
};
