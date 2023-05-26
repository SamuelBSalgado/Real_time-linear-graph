//SOLO MODIFICAR ESTE JOTAESE. PENESEGURO ES LA COPIA DE SEGURIDAD.
const arrNuevo = [ //Array original que viene de la ESP32
  { name: 'lux', value: 230, state: false },
  { name: 'flama', value: 0, state: false },
  { name: 'humo', value: 242, state: false }
];

//Valores arrastrados a este array para que se definan como arrayAnterior y se elimine al pasar 2 ciclos.
//"let arrViejo = [...arrNuevo];"" estaría descomentado para el proyecto final, y el de las lineas 12 a 16 se comentaría.
let arrViejo = [...arrNuevo]; //Copia del array nuevo (original) a manera de ejemplificar una dinámica más "realista".

// const arrViejo = [ //este array se usa sólo para ver que cambie de valor la grafica más exactamente.
//   { name: 'lux', value: 224, state: false },
//   { name: 'flama', value: 0, state: false },
//   { name: 'humo', value: 242, state: false }
// ];
// IMPORTANTE LEER => SE ME OCURRIÓ QUE al estar actualizandose constantemente arrNuevo(es el array mandado por la ESP32), que se cree otro array llamado anterior que guarde los valores del arrayNuevo que 1 segundo después será viejo, así que se hace esa copia en ese array auxiliar y se actualiza el array de la ESP, por lo que siempre es nuevo. Más tarde en la línea 163 se establecen estos cambios que te digo para que en el código base de amCharts se borre el valor anerior que se imprimió en la gráfica.

am5.ready(() => { //Una vez que la biblioteca amCharts esté lista, el código se ejecutará.
  
  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  const root = am5.Root.new("chartdiv");
  
  
  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([
    am5themes_Animated.new(root)
  ]);
  
  /* AQUÍ SE INSERTA LA INFORMACIÓN DE LOS SENSORES (QUITAR RANDOM DATA) */
  // Generate random data
  let value;
  
  // function generateChartData() {
  //   const chartData = []; //Este array es el que se imprime en la grafica. En él se guardan los valores del array nuevo.
  //   let firstDate = new Date();
  //   firstDate.setDate(firstDate.getDate() - 1000);
  //   firstDate.setHours(0, 0, 0, 0);
  
  //   for (let i = 0; i <= arrNuevo.length; i++) { //Este for se encarga de agregar el valor tiempo (segundos) con cada recorrido que le haga al array de objetos, a su vez seteando leyendo el valor del nuevo array.
  //     let newDate = new Date(firstDate);
  //     newDate.setSeconds(newDate.getSeconds() + i);
  //     value = arrNuevo[0].value;
      
  //     // value = (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10;
  
  //     chartData.push({
  //       date: newDate.getTime(),
  //       value: value //Info del JSON
  //     });
  //   }
  //   return chartData;
  // }

  //RECOMENDACIÓN DE CHATGPT (REEMPLAZO DE generateChartData())-------------------------------------------
  function updateChartData() {
    const chartData = [];
    let firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - 1000);
    firstDate.setHours(0, 0, 0, 0);
  
    for (let i = 0; i < arrNuevo.length; i++) {
      let newDate = new Date(firstDate);
      newDate.setSeconds(newDate.getSeconds() + i);
      value = arrNuevo[0].value;
  
      chartData.push({
        date: newDate.getTime(),
        value: value
      });
    }
    return chartData;
  }

  
  let data = updateChartData();
  
  
  // Create chart
  // https://www.amcharts.com/docs/v5/charts/xy-chart/
  let chart = root.container.children.push(am5xy.XYChart.new(root, {
    focusable: true,
    panX: true,
    panY: true,
    wheelX: "panX",
    wheelY: "zoomX",
    pinchZoomX:true
  }));
  
  let easing = am5.ease.linear;
  
  
  // Create axes
  // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
    maxDeviation: 0.5,
    groupData: false,
    extraMax:0.1, // this adds some space in front
    extraMin:-0.1,  // this removes some space form th beginning so that the line would not be cut off
    baseInterval: {
      timeUnit: "second",
      count: 1
    },
    renderer: am5xy.AxisRendererX.new(root, {
      minGridDistance: 50
    }),
    tooltip: am5.Tooltip.new(root, {})
  }));
  
  let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {})
  }));
  
  
  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  let series = chart.series.push(am5xy.LineSeries.new(root, {
    name: "Series 1",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    valueXField: "date",
    tooltip: am5.Tooltip.new(root, {
      pointerOrientation: "horizontal",
      labelText: "{valueY}"
    })
  }));
  
  // tell that the last data item must create bullet
  data[data.length - 1].bullet = true;
  series.data.setAll(data);
  
  
  // Create animating bullet by adding two circles in a bullet container and
  // animating radius and opacity of one of them.
  series.bullets.push((root, series, dataItem) => {  
    // only create sprite if bullet == true in data context
    if (dataItem.dataContext.bullet) {    
      let container = am5.Container.new(root, {});
      let circle0 = container.children.push(am5.Circle.new(root, {
        radius: 5,
        fill: am5.color(0xff0000)
      }));
      let circle1 = container.children.push(am5.Circle.new(root, {
        radius: 5,
        fill: am5.color(0xff0000)
      }));
  
      circle1.animate({
        key: "radius",
        to: 20,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      });
      circle1.animate({
        key: "opacity",
        to: 0,
        from: 1,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      });
  
      return am5.Bullet.new(root, {
        locationX:undefined,
        sprite: container
      })
    }
  })
  
  
  // Add cursor
  // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
  let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
    xAxis: xAxis
  }));
  cursor.lineY.set("visible", false);
  
  
  // Update data every second
  setInterval(() => {
    addData();
  }, 1000) //Tiempo de refrescamiento
  
  
  function addData(){
    let lastDataItem = series.dataItems[series.dataItems.length - 1];

    let lastValue = arrViejo[0].value;//series.dataItems[series.dataItems.length -2].get("valueY");//lastDataItem.get("valueY");
    let newValue = arrNuevo[0].value;//value;// + ((Math.random() < 0.5 ? 1 : -1) * Math.random() * 5); //VER Q PEDO AQUI. HACER QUE NEWVALUE SEA LA SIGUIENTE LLEGADA DE INFO DEL ARRAY DE OBJETOS.
    let lastDate = new Date(lastDataItem.get("valueX"));
    let time = am5.time.add(new Date(lastDate), "second", 1).getTime();
    series.data.removeIndex(0); //Esto elimina el primer valor pusheado a chartData (el valor más viejo) para que no se agrande demasiado.
    series.data.push({
      date: time,
      value: value //newValue
    })
  
    let newDataItem = series.dataItems[series.dataItems.length - 1];
    newDataItem.animate({
      key: "valueYWorking",
      to: newValue,
      from: lastValue,
      duration: 600,
      easing: easing
    });
  
    // use the bullet of last data item so that a new sprite is not created
    newDataItem.bullets = [];
    newDataItem.bullets[0] = lastDataItem.bullets[0];
    newDataItem.bullets[0].get("sprite").dataItem = newDataItem;
    // reset bullets
    lastDataItem.dataContext.bullet = false;
    lastDataItem.bullets = [];
  
  
    let animation = newDataItem.animate({
      key: "locationX",
      to: 0.5,
      from: -0.5,
      duration: 600
    });
    if (animation) {
      let tooltip = xAxis.get("tooltip");
      if (tooltip && !tooltip.isHidden()) {
        animation.events.on("stopped", () => {
          xAxis.updateTooltip();
        })
      }
    }
  }

  // RECOMENDACION DE CHATGPT (reemplazo de addData())----------------------------------
  // function updateChart() {
  //   let lastDataItem = series.dataItems[series.dataItems.length - 1];
  //   let lastValue = arrViejo[0].value;//lastDataItem.get("valueY");
  //   let newValue = arrNuevo[0].value;
  //   let lastDate = new Date(lastDataItem.get("valueX"));
  //   let time = am5.time.add(new Date(lastDate), "second", 1).getTime();

  //   series.data.removeIndex(0);
  //   series.data.push({
  //     date: time,
  //     value: newValue
  //   });
  
  //   let newDataItem = series.dataItems[series.dataItems.length - 1];//CREO QUE ESTE ES EL PEDO
  //   newDataItem.animate({
  //     key: "valueYWorking",
  //     to: newValue,
  //     from: lastValue,
  //     duration: 600,
  //     easing: easing
  //   });
  
  //   newDataItem.bullets = [];
  //   newDataItem.bullets[0] = lastDataItem.bullets[0];
  //   newDataItem.bullets[0].get("sprite").dataItem = newDataItem;
  //   //reset bullets
  //   lastDataItem.dataContext.bullet = false;
  //   lastDataItem.bullets = [];
  
  //   let animation = newDataItem.animate({
  //     key: "locationX",
  //     to: 0.5,
  //     from: -0.5,
  //     duration: 600
  //   });
  
  //   if (animation) {
  //     let tooltip = xAxis.get("tooltip");
  //     if (tooltip && !tooltip.isHidden()) {
  //       animation.events.on("stopped", () => {
  //         xAxis.updateTooltip();
  //       });
  //     }
  //   }
  // }


  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  chart.appear(1000, 100);
  
  }); // Here ends am5.ready()