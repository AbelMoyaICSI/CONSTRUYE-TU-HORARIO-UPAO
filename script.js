
$(document).ready(function() {
  var selectedRow = null;

  function compareHours(time1, time2) {
    var [hour1, minute1] = time1.split(':').map(Number);
    var [hour2, minute2] = time2.split(':').map(Number);
    if (hour1 !== hour2) return hour1 - hour2;
    return minute1 - minute2;
  }

  function aplicarEstilosColor(celda, modalidad) {
    celda.removeClass('presencial no-presencial').addClass(modalidad);
  }

  function insertarFila(nombreCurso, horaInicio, horaFin, dia, modalidad, liga, nrc) {
    var rows = $('#calendarioBody tr.editable');
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

    var existingRow = rows.filter(function () {
      var existingHora = $(this).find('td:first').text();
      var existingDayCell = $(this).find('td[data-day="' + dia + '"]');
      var existingLiga = existingDayCell.find('p').text();
      return existingDayCell.text().includes(nombreCurso) && existingHora === horaInicio + ' - ' + horaFin && existingLiga === liga;
    });

    if (existingRow.length > 0) {
      alert('¡Error! Ya existe un curso con el mismo nombre, día, horario y liga.');
      return;
    }

    var choque = false;
    rows.each(function(index, row) {
      var rowHora = $(row).find('td:first').text();
      if ($(row).find('td[data-day="' + dia + '"]').text() !== '') {
        if (compareHours(horaInicio, rowHora.split(' - ')[1]) <= 0 && compareHours(horaFin, rowHora.split(' - ')[0]) >= 0) {
          choque = true;
          return false;
        }
      }
      for (var i = 1; i < 8; i++) {
        var currentDay = $('#calendarioBody th:nth-child(' + i + ')').text().toLowerCase();
        if (currentDay !== dia && $(row).find('td[data-day="' + currentDay + '"]').text() !== '') {
          if (compareHours(horaInicio, rowHora.split(' - ')[1]) <= 0 && compareHours(horaFin, rowHora.split(' - ')[0]) >= 0) {
            choque = true;
            return false;
          }
        }
      }
    });

    if (choque) {
      alert('¡Error! El curso choca con un horario existente de otro curso en algún día.');
      return;
    }

    var dayCell = newRow.find('td[data-day="' + dia + '"]');
    dayCell.text(nombreCurso).append('<p>' + liga + '</p>').append('<p>' + nrc + '</p>');
    aplicarEstilosColor(dayCell, modalidad);

    var existingRowSameHours = rows.filter(function () {
      return $(this).find('td:first').text() === horaInicio + ' - ' + horaFin;
    });

    if (existingRowSameHours.length > 0) {
      var existingDayCell = existingRowSameHours.find('td[data-day="' + dia + '"]');
      if (existingDayCell.text() !== '') {
        alert('¡Error! Ya existe un curso con el mismo horario en este día.');
        return;
      } else {
        existingDayCell.text(nombreCurso).append('<p>' + liga + '</p>').append('<p>' + nrc + '</p>');
        aplicarEstilosColor(existingDayCell, modalidad);
        return;
      }
    }

    function getIndexToInsert() {
      for (var i = 0; i < rows.length; i++) {
        var existingHora = $(rows[i]).find('td:first').text();
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
        if (currentCell.text() === nextCell.text() && currentCell.text() !== '') {
          var rowspan = currentCell.attr('rowspan') || 1;
          currentCell.attr('rowspan', parseInt(rowspan) + 1);
          nextCell.remove();
        }
      });
    });
  }

  $('#calendarioBody').on('click', 'td', function() {
    $('td').removeClass('selected');
    $(this).addClass('selected');
    selectedRow = $(this).closest('tr');
  });

  $('#insertarBtn').click(function() {
    var nombreCurso = $('#nombreCurso').val();
    var horaInicio = $('#horaInicio').val();
    var horaFin = $('#horaFin').val();
    var dia = $('#dia').val();
    var modalidad = $('#modalidad').val();
    var liga = $('#liga').val();
    var nrc = $('#nrc').val();

    insertarFila(nombreCurso, horaInicio, horaFin, dia, modalidad, liga, nrc);
  });

  $('#eliminarCursoBtn').click(function() {
    if (selectedRow) {
      selectedRow.remove();
      selectedRow = null;
    } else {
      alert('Por favor, selecciona una fila para eliminar.');
    }
  });

  $('#capturarBtn').click(function() {
    html2canvas(document.querySelector("#tablaHorario")).then(canvas => {
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
