import "./assets/style/style.css";

/*========================*/
/*===== DOM Elements =====*/
/*========================*/

const drawer = document.querySelector<HTMLDivElement>(".drawer")!;
const drawerBg = document.querySelector<HTMLDivElement>(".drawer_bg")!;
const drawerBtn = document.querySelector<HTMLDivElement>(".drawer_btn")!;
const drawerScannerVideo = document.querySelector<HTMLVideoElement>(
  ".drawer_scanner_video"
)!;
const drawerScanner =
  document.querySelector<HTMLDivElement>(".drawer_scanner")!;
const drawerScannerCanvas = document.querySelector<HTMLCanvasElement>(
  ".drawer_scanner_canvas"
)!;
const drawerRoleSelector = document.querySelector<HTMLSelectElement>(
  ".drawer_role_selector"
)!;
const drawerQRCode = document.querySelector<HTMLDivElement>(".drawer_qrcode")!

/*=====================*/
/*===== App State =====*/
/*=====================*/

interface State {
  role: "game" | "player" | null;
  isConnected: boolean;
  isScanning: boolean;
  scan: number;
  stream: MediaStream | null;
  localConnection: RTCPeerConnection;
  iceCandidate: string;
  channel: RTCDataChannel | null;
}

const state: State = {
  role: "player",
  isConnected: false,
  isScanning: false,
  stream: null,
  scan: 0,
  localConnection: new RTCPeerConnection(),
  iceCandidate: "",
  channel: null,
};

main()

/*================*/
/*===== Main =====*/
/*================*/

function main() {
  state.localConnection.onicecandidate = () => {
    state.iceCandidate = JSON.stringify(state.localConnection.localDescription);
    console.log(" NEW ice candidnat!! on localconnection reprinting SDP ");
    console.log(state.iceCandidate);
  };
  
  drawerBg.onclick = () => {
    if (drawer.classList.contains("active")) drawer.classList.remove("active");
    if (state.isScanning) {
      state.isScanning = false;
      clearInterval(state.scan);
    }
  };
  
  drawerRoleSelector.onchange = () => {
    if (
      drawerRoleSelector.value == "game" ||
      drawerRoleSelector.value == "player"
    )
      state.role = drawerRoleSelector.value;
      setWebRTC();
  };
  
  drawerBtn.onclick = async (e) => {
    e.preventDefault();
  
    // drawer activation
    drawer.classList.add("active");
  
    // stop if already connected
    if (state.isConnected) return;
    // camera stream permission
    if (!navigator || !navigator.mediaDevices) throw new Error("no media device");
    // create camera stream
    state.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    // attach camera stream to video elmt
    drawerScannerVideo.srcObject = state.stream;
    // run scan
    scan();
  };

  setWebRTC()
}

/*================*/
/*===== Core =====*/
/*================*/

/**
 * Scan a stream video and detect a qrcode
 */
function scan() {
  //prevent the scan if the connection is already set
  if (state.isConnected) return;

  // start scan interval
  state.isScanning = true;
  state.scan = setInterval(() => {
    // get scanner size
    const style = {
      height: Number(
        window
          .getComputedStyle(drawerScanner, null)
          .getPropertyValue("height")
          .slice(0, -2)
      ),
      width: Number(
        window
          .getComputedStyle(drawerScanner, null)
          .getPropertyValue("width")
          .slice(0, -2)
      ),
    };
    // create a picture of the stream in a canvas
    const context = drawerScannerCanvas.getContext("2d")!;
    context.drawImage(drawerScannerVideo, 0, 0, style.width, style.height);
    //get the ImageData data from the canvas
    const data = context.getImageData(0, 0, style.width, style.height).data;
    //analyse if the data contain a QRCode
    const code = jsQR(data, style.width, style.height, {});
    if (code) {
      // if a QRCode is found => stop scan
      clearInterval(state.scan);
      state.isScanning = false;
      // success log
      console.log("Found QR code", code);

      try {
        const iceCandidate = JSON.parse(code.data)
        connect(iceCandidate)
      } catch (err) {
        console.error(err)
      }
    } else {
      // log of a fail iteration
      console.log("Did not Found QR code");
    }
  }, 500);
}

/**
 * Create a WebRTC Connection
 */
function setWebRTC() {

  if (!state.role) return;

  if (state.role == "game") {
    state.channel = state.localConnection.createDataChannel("sendChannel");
    state.channel.onmessage = (e) =>
      console.log("messsage received!!!" + e.data);
    state.channel.onopen = () => console.log("open!!!!");
    state.channel.onclose = () => console.log("closed!!!!!!");
    state.localConnection
      .createOffer()
      .then((o) => {
        state.localConnection.setLocalDescription(o)
        new QRCode(drawerQRCode, JSON.stringify(state.localConnection.localDescription));
      });

  } else {
    
    state.localConnection.onicecandidate =  () =>  {
      console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
      console.log(JSON.stringify(state.localConnection.localDescription) )
      new QRCode(drawerQRCode, JSON.stringify(state.localConnection.localDescription));
    }

    state.localConnection.ondatachannel= e => {
      const receiveChannel = e.channel;
      receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
      receiveChannel.onopen = () => console.log("open!!!!");
      receiveChannel.onclose =() => console.log("closed!!!!!!");
      state.channel = receiveChannel;
    }
  }
}

function connect(iceCandidate: RTCSessionDescriptionInit) {
  state.localConnection.setRemoteDescription (iceCandidate).then(()=>console.log("done"))
}
