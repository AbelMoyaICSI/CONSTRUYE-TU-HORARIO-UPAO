$(document).ready(function() {
  
  var cursos = [];
  var selectedActivityIndex = null; 
  var selectedCell = null;         

  var dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];


  function compareHours(h1, h2) {
    var [a1, b1] = h1.split(":").map(Number);
    var [a2, b2] = h2.split(":").map(Number);
    if (a1 !== a2) return a1 - a2;
    return b1 - b2;
  }

 
  function checkOverlapAny(nombre, dia, horaInicio, horaFin) {
    for (let i = 0; i < cursos.length; i++) {
      let c = cursos[i];
      if (c.dia.toLowerCase() === dia.toLowerCase()) {
        // Se solapan si: (horaInicioNuevo < horaFinExistente) && (horaFinNuevo > horaInicioExistente)
        if (compareHours(horaInicio, c.horaFin) < 0 && compareHours(horaFin, c.horaInicio) > 0) {
          return c;
        }
      }
    }
    return null;
  }


  function construirTabla() {

    let timePoints = [];
    cursos.forEach(curso => {
      timePoints.push(curso.horaInicio);
      timePoints.push(curso.horaFin);
    });

    timePoints = Array.from(new Set(timePoints));
    timePoints.sort(compareHours);


    $("#calendarioBody").empty();
    let rows = [];
    for (let i = 0; i < timePoints.length - 1; i++) {
      let start = timePoints[i];
      let end = timePoints[i + 1];
      let $tr = $("<tr></tr>");

      $tr.append("<td>" + start + " - " + end + "</td>");

      dias.forEach(dia => {
        let $td = $("<td data-day='" + dia + "' data-start='" + start + "' data-end='" + end + "' class='align-middle'></td>");
        $tr.append($td);
      });
      rows.push($tr);
    }
    rows.forEach(row => $("#calendarioBody").append(row));


    $("#calendarioBody tr").each(function() {
      let timeRange = $(this).find("td:first").text();
      let [rowStart, rowEnd] = timeRange.split(" - ");
      $(this).find("td").each(function(index) {
        if (index === 0) return; 
        let dia = $(this).attr("data-day");

        let curso = cursos.find(c =>
          c.dia.toLowerCase() === dia &&
          compareHours(c.horaInicio, rowStart) <= 0 &&
          compareHours(c.horaFin, rowEnd) >= 0
        );
        if (curso) {
          $(this).text(curso.nombre);
          $(this).append('<p>' + curso.liga + '</p>').append('<p>' + curso.nrc + '</p>');
          $(this).css({
            "background-color": (curso.modalidad === "presencial") ? "#004593" : "#ec6407",
            "color": "#fff",
            "text-align": "center",
            "font-weight": "bold"
          });
        }
      });
    });
  

    $("#calendarioBody tr").each(function() {
      let tieneCurso = false;
      $(this).find("td").each(function(index) {
        if (index === 0) return;
        if ($(this).text().trim() !== "") {
          tieneCurso = true;
        }
      });
      if (!tieneCurso) {
        $(this).remove();
      }
    });
  

    for (let col = 1; col <= dias.length; col++) {
      let prevCell = null;
      let rowspan = 1;
      $("#calendarioBody tr").each(function() {
        let cell = $(this).find("td").eq(col);
        if (prevCell && cell.is(":visible") && cell.text().trim() !== "" &&
            cell.text() === prevCell.text() &&
            cell.css("background-color") === prevCell.css("background-color")) {
          rowspan++;
          prevCell.attr("rowspan", rowspan);
          cell.hide();
        } else {
          prevCell = cell;
          rowspan = 1;
        }
      });
    }
  }
  

  function intentarFusionar(nombreCurso, horaInicio, horaFin, dia, modalidad, liga, nrc) {
    var rows = $('#calendarioBody tr');
    for (var i = 0; i < rows.length; i++) {
      var $row = $(rows[i]);
      var rangoText = $row.find('td:first').text().trim();
      if (!rangoText) continue;
      var [existingInicio, existingFin] = rangoText.split(' - ');
      var $cell = $row.find('td[data-day="' + dia + '"]');

      if ($cell.text().trim() === nombreCurso) {

        if (compareHours(horaInicio, existingFin) === 0 || compareHours(horaFin, existingInicio) === 0) {
          var newInicio = compareHours(existingInicio, horaInicio) <= 0 ? existingInicio : horaInicio;
          var newFin = compareHours(existingFin, horaFin) >= 0 ? existingFin : horaFin;
          $row.find('td:first').text(newInicio + ' - ' + newFin);
          $cell.empty().text(nombreCurso)
            .append('<p>' + liga + '</p>')
            .append('<p>' + nrc + '</p>');
          $cell.css({
            "background-color": (modalidad === "presencial") ? "#004593" : "#ec6407",
            "color": "#fff",
            "text-align": "center",
            "font-weight": "bold"
          });
          return true;
        }

        if (compareHours(existingInicio, horaInicio) <= 0 && compareHours(existingFin, horaFin) >= 0) {
          alert("Ya existe el curso en ese horario para " + dia + ".");
          return true;
        }
      }

      if (compareHours(existingInicio, horaInicio) <= 0 && compareHours(existingFin, horaFin) >= 0) {
        var targetCell = $row.find('td[data-day="' + dia + '"]');
        if (targetCell.text().trim() === "") {
          targetCell.text(nombreCurso)
            .append('<p>' + liga + '</p>')
            .append('<p>' + nrc + '</p>');
          targetCell.css({
            "background-color": (modalidad === "presencial") ? "#004593" : "#ec6407",
            "color": "#fff",
            "text-align": "center",
            "font-weight": "bold"
          });
          return true;
        } else {
          alert("Ya existe un curso en ese horario para " + dia + ".");
          return true;
        }
      }

      if (compareHours(horaInicio, existingInicio) <= 0 && compareHours(horaFin, existingFin) >= 0) {
        $row.find('td:first').text(horaInicio + ' - ' + horaFin);
        var targetCell = $row.find('td[data-day="' + dia + '"]');
        if (targetCell.text().trim() === "") {
          targetCell.text(nombreCurso)
            .append('<p>' + liga + '</p>')
            .append('<p>' + nrc + '</p>');
          targetCell.css({
            "background-color": (modalidad === "presencial") ? "#004593" : "#ec6407",
            "color": "#fff",
            "text-align": "center",
            "font-weight": "bold"
          });
          return true;
        } else {
          alert("Ya existe un curso en ese horario para " + dia + ".");
          return true;
        }
      }
    }
    return false;
  }
  

  function insertarFila(nombreCurso, horaInicio, horaFin, dia, modalidad, liga, nrc) {

    var conflict = checkOverlapAny(nombreCurso, dia, horaInicio, horaFin);
    if (conflict) {
      alert("El curso '" + nombreCurso + "' (" + horaInicio + " - " + horaFin + ") se cruza con '" + conflict.nombre + "' (" + conflict.horaInicio + " - " + conflict.horaFin + ") en " + dia + ".");
      return;
    }
    

    var rows = $('#calendarioBody tr.editable');
    if (intentarFusionar(nombreCurso, horaInicio, horaFin, dia, modalidad, liga, nrc)) {
      fusionarCeldas();
      return;
    }
    
  
    var existingRow = rows.filter(function() {
      var existingHora = $(this).find('td:first').text().trim();
      return existingHora === horaInicio + ' - ' + horaFin;
    });
    if (existingRow.length > 0) {
      var existingDayCell = existingRow.find('td[data-day="' + dia + '"]');
      if (existingDayCell.text().trim() !== '') {
        alert("Ya existe un curso en ese horario para " + dia + ".");
        return;
      } else {
        existingDayCell.text(nombreCurso)
          .append('<p>' + liga + '</p>')
          .append('<p>' + nrc + '</p>');
        existingDayCell.css({
          "background-color": (modalidad === "presencial") ? "#004593" : "#ec6407",
          "color": "#fff",
          "text-align": "center",
          "font-weight": "bold"
        });
        fusionarCeldas();
        return;
      }
    }
    

    var newRowHtml = '<tr class="editable">' +
      '<td>' + horaInicio + ' - ' + horaFin + '</td>' +
      '<td data-day="lunes" class="align-middle"></td>' +
      '<td data-day="martes" class="align-middle"></td>' +
      '<td data-day="miércoles" class="align-middle"></td>' +
      '<td data-day="jueves" class="align-middle"></td>' +
      '<td data-day="viernes" class="align-middle"></td>' +
      '<td data-day="sábado" class="align-middle"></td>' +
      '<td data-day="domingo" class="align-middle"></td>' +
      '</tr>';
    var newRow = $(newRowHtml);
    var dayCell = newRow.find('td[data-day="' + dia + '"]');
    dayCell.text(nombreCurso)
      .append('<p>' + liga + '</p>')
      .append('<p>' + nrc + '</p>');
    dayCell.css({
      "background-color": (modalidad === "presencial") ? "#004593" : "#ec6407",
      "color": "#fff",
      "text-align": "center",
      "font-weight": "bold"
    });
    

    function getIndexToInsert() {
      for (var i = 0; i < rows.length; i++) {
        var existingHora = $(rows[i]).find('td:first').text().trim();
        if (compareHours(horaInicio, existingHora.split(' - ')[0]) < 0) {
          return i;
        }
      }
      return rows.length;
    }
    var insertIndex = getIndexToInsert();
    if (insertIndex === rows.length) {
      $('#calendarioBody').append(newRow);
    } else {
      $(rows[insertIndex]).before(newRow);
    }
  
    fusionarCeldas();
  }
  
 
  function fusionarCeldas() {
    var rows = $('#calendarioBody tr');
    rows.each(function(index, row) {
      var cells = $(row).find('td');
      cells.each(function(cellIndex, cell) {
        var currentCell = $(cell);
        var nextCell = $(cells[cellIndex + 1]);
        if (nextCell.length && currentCell.text().trim() !== '' &&
            currentCell.text().trim() === nextCell.text().trim() &&
            currentCell.css("background-color") === nextCell.css("background-color")) {
          var rowspan = currentCell.attr('rowspan') || 1;
          currentCell.attr('rowspan', parseInt(rowspan) + 1);
          nextCell.remove();
        }
      });
    });
  }
  

  $('#calendarioBody').on('click', 'td', function() {
    if ($(this).index() === 0) return;
    $('td').removeClass('selected');
    $(this).addClass('selected');
    selectedCell = $(this);
    let idx = buscarActividadPorCelda($(this));
    selectedActivityIndex = (idx >= 0) ? idx : null;
  });
  

  function buscarActividadPorCelda($cell) {
    let $row = $cell.closest('tr');
    let timeRange = $row.find('td:first').text().trim();
    let [rowStart, rowEnd] = timeRange.split(' - ');
    let dia = $cell.attr('data-day');
    let nombre = $cell.text().trim();
    for (let i = 0; i < cursos.length; i++) {
      let c = cursos[i];
      if (c.dia.toLowerCase() === dia.toLowerCase() &&
          c.nombre === nombre &&
          compareHours(c.horaInicio, rowStart) <= 0 &&
          compareHours(c.horaFin, rowEnd) >= 0) {
        return i;
      }
    }
    return -1;
  }
  

  $('#insertarBtn').click(function() {
    var nombreCurso = $('#nombreCurso').val().trim();
    var horaInicio = $('#horaInicio').val().trim();
    var horaFin = $('#horaFin').val().trim();
    var dia = $('#dia').val();
    var modalidad = $('#modalidad').val();
    var liga = $('#liga').val();
    var nrc = $('#nrc').val().trim();
  
    if (!nombreCurso || !horaInicio || !horaFin) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (compareHours(horaFin, horaInicio) <= 0) {
      alert('La hora de fin debe ser mayor que la de inicio.');
      return;
    }
  

    let conflict = checkOverlapAny(nombreCurso, dia, horaInicio, horaFin);
    if (conflict) {
      alert("El curso '" + nombreCurso + "' (" + horaInicio + " - " + horaFin + ") se cruza con '" + conflict.nombre + "' (" + conflict.horaInicio + " - " + conflict.horaFin + ") en " + dia + ".");
      return;
    }
  

    cursos.push({ nombre: nombreCurso, dia: dia, horaInicio: horaInicio, horaFin: horaFin, liga: liga, nrc: nrc, modalidad: modalidad });
    construirTabla();
  });
  

  $('#eliminarBtn').click(function() {
    if (selectedActivityIndex !== null && selectedActivityIndex >= 0) {
      cursos.splice(selectedActivityIndex, 1);
      selectedActivityIndex = null;
      selectedCell = null;
      construirTabla();
    } else {
      alert("Selecciona una actividad para eliminar.");
    }
  });
  

  $('#capturarBtn').click(function() {
    html2canvas(document.querySelector("#tablaHorario")).then(function(canvas) {
      var link = document.createElement('a');
      link.download = 'horario.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  });
  

  $('.instructions').click(function() {
    $('.instructions-list').slideToggle("slow");
    $(this).find('i').toggleClass('right');
  });
});
