console.log("ok")
const url = "https://lalang-haole.herokuapp.com"
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

/* 
 User select text => show popup
 User click `la lang` => call api, set isReading true
 User click `la lang` while isReading is true => alert error
 User click `x`. stop the reading and delete popup

*/

const controller = {
  popup : null,
  data : "",
  lang : "vi",
  isReading: false,
  isFetching: false,
  player: null,
  setPopup(node){
    if(node instanceof Element){
      this.popup = node
    }
  },
  getPopup(){
    return this.popup
  },
  deletePopup(){
    this.popup = null
    return
  },

  controlBtns : [], /* start/stop btn, 3 speed btn (1x, 1.25x, 1.5x) */
}

const shareBtnCss = `
  border: 2px solid black;
  border-radius: 5px;
  font-weight: bold;
  margin: 0 2px;
  z-index: 1000
`
const pupleBtn = `
  background-color: #bb53ff;
`

const btnCss = shareBtnCss + pupleBtn

// utils function
const createElement = (tagName, children, cssText, options=null) => {
  try {
    const E = document.createElement(tagName)
    E.style.cssText = cssText
    // attribute
    if(options){
      Object.keys(options).forEach(key => E.setAttribute(key, options[key]))
    }
    // children
    if(children instanceof Element){ /* children is 1 Element */
      E.appendChild(children)

    } else if(typeof children === "string") { /* children is 1 string */
      const textNode = document.createTextNode(children)
      E.appendChild(textNode)

    } else if(Array.isArray(children)){ /* children is an array (of Element or string) */
      children.forEach(node => {

        if(node instanceof Element){
          E.appendChild(node)
        } else if (typeof node === "string"){

          const textNode = document.createTextNode(node)
          E.appendChild(textNode)
        }
      })
    }
    return E  
  } catch (error) {
    throw error
  }
}

const render = node => document.getElementsByTagName("body")[0].appendChild(node)
// 

// components

// start btn
const startBtn = createElement(
  'button',
  'La làng',
  btnCss
)
startBtn.addEventListener("click", function(e){
  // should click?
  if(controller.isReading){
    alert("Đang la làng! Vui lòng cho tui nín rồi tui la làng cái khác cho :D")
    return
  }
  if(controller.isFetching){
    alert("Đợi xíu uống miếng nước rồi la cho nghe ;P")
    return
  }

  // start fetch
  controller.isFetching = true
  // send to server
  fetch(`${url}/to-speak/${controller.lang}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: controller.data })
  })
  .then(res => res.arrayBuffer())
  .then(data => ctx.decodeAudioData(data))
  .then(decodedAudio => {
    // set isReading -> true
    controller.isReading = true

    // start reading
    const player = ctx.createBufferSource()
    controller.player = player
    player.buffer = decodedAudio
    player.connect(ctx.destination)
    player.start(ctx.currentTime)

    // stop fetch
    controller.isFetching = false
  })
  .catch(error => {
    console.log(error)
    controller.isFetching = false
    controller.player = null
  })

}, true)
// 


// speed controller
const [normalSpeed, mediumSpeed, fastSpeed] = [1.0, 1.25, 1.5].map(speed => {
  const speedBtn = createElement(
    'button',
    `${speed}x`,
    btnCss
  )
  speedBtn.addEventListener("click", function(e){
    if(controller.player){
      controller.player.playbackRate.value = speed
    }
  }, true)

  return speedBtn
})
// 

// select btn
const en = createElement(
  'option',
  'en',
  "",
  { value: "en" }
)
const vi = createElement(
  'option',
  'vi',
  "",
  { value: "vi", selected: true }
)
const selector = createElement(
  'select',
  [vi, en],
  ""
)
selector.addEventListener('change', function(e){
  controller.lang = e.target.value
})
// 

// stop btn
const stopBtn = createElement(
  'button',
  'Nín',
  btnCss
)

stopBtn.addEventListener("click", function(e){
// step:
  // stop Audio Context
  // set isReading -> false
  // delete popup

// implement:
  if(controller.player){
    controller.player.stop()
    controller.isReading = false
  }

  // delete Element if exist
  const E = controller.getPopup()
  if(E){
    E.parentNode.removeChild(E)
    controller.deletePopup()
  }
}, true)



// window functions

document.addEventListener('mouseup', function(event){
  if(!controller.getPopup()){
    const selection = window.getSelection()
    const data = selection.toString()
    if(!!data.length){
      const baseRange = selection.getRangeAt(0)
      const range = baseRange.cloneRange()
      range.collapse(false);
      const dummy = document.createElement("span");
      range.insertNode(dummy);
      const rect = dummy.getBoundingClientRect();
      const x = rect.left, y = rect.top;
      dummy.parentNode.removeChild(dummy);
      
      // store data
      controller.data = data

      // create element and render
      const E = createElement(
        "div", 
        [selector, startBtn, stopBtn, normalSpeed, mediumSpeed, fastSpeed], 
        `
          position: absolute; top: ${10 + y + document.documentElement.scrollTop}px; 
          left: ${x}px; z-index: 999; padding: 5px; border-radius: 5px;
          background-color: white; border: 1px solid gray; display: flex;
          flex-wrap: wrap, align-content: space-between; justify-content: space-between
        `
      )
      render(E)
      // store Element to controller
      controller.setPopup(E)
    }
  }
}, true)

