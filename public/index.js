const text = document.getElementById("input")
const btn = document.getElementById("btn")
const lang = document.getElementById("lang")

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

btn.addEventListener("click", () => {
  if(!!text.value.length){
    console.log(text.value)
    axios.post(`/to-speak/${lang.value}`, {
      data : text.value
    }, {
      responseType: 'arraybuffer'
    })
    .then(res => {
      const { data } = res
      return ctx.decodeAudioData(data)
    })
    .then(decodedAudio => {
      const player = ctx.createBufferSource()
      player.buffer = decodedAudio
      player.connect(ctx.destination)
      player.start(ctx.currentTime)
    })
  }
})
