$(document).ready(function(){
  // hide message box
  $('.message-wrapper').hide();
  // take data from DB and display it on web page
  appendToDom();
  // accept new task from user
  $('#task-form').on('submit', takeNewTaskData);
  $('.task-list').on('click', '.delete', areYouSure);
  $('.task-list').on('click', '.complete, .reassign', changeTaskStatus);
  $('.message-wrapper').on('click', '.btn-green', canselDelete);
  $('.message-wrapper').on('click', '.btn-red', deleteTask);

});
// global task object to store id of potential delete task
var task = {};
function takeNewTaskData(event){
  event.preventDefault();
  var task = {};

  //collect data from filled fields
  $.each($('#task-form').serializeArray(), function (i, field) {
    task[field.name] = field.value;
  });

  //clear fields after submit
  $('#task-form').find('input[type=text]').val('');
  $('#task-form').find('textarea').val('');
  $("#task").trigger("focus");
  //now add task to DB
  addTaskToDB(task);
}

//add task to DB
function addTaskToDB(task){
  $.ajax({
    type: 'POST',
    url: '/todo',
    data: task,
    success: appendToDom
  });
}

//get data from DB and display it on web page
function appendToDom(){
    $.ajax({
    type: 'GET',
    url: '/todo',
    success: function(tasks){
        $('.task-list').empty();
        tasks.forEach(function(task){
          if(task.completed){
            //completed task
            $('.task-list').append('<div data-id="' + task.id + '" class="task-box completed"></div>');
          }else{
            // incomplete task
            $('.task-list').append('<div data-id="' + task.id + '" class="task-box"></div>');
          }
          var $el = $('.task-list').children().last();
          $el.append('<p class="task">' + task.task + '</p>');
          $el.append('<p class="description">' + task.description + '</p>');
          if(task.completed){
            $el.append('<button class="btn-green reassign">Reassign Task</button>');
          }else{
            $el.append('<button class="btn-green complete">Complete Task</button>');
          }
          $el.append('<button class="delete btn-red">Delete Task</button>');
        });
    }
  });
}

// Do you really want to delete check funciton
function areYouSure(event){
  event.preventDefault();
  task = {};
  task.id = $(this).parent().data('id');
  $('.main').addClass('blur');
  $('.message-wrapper').show();
}
// Cansel DELETE
function canselDelete(){
  $('.message-wrapper').hide();
  $('.main').removeClass('blur');
  //empty task object
  task = {};
}
// delete task
function deleteTask(){
  $.ajax({
    type: 'DELETE',
    data: task,
    url: '/todo',
    success: finishDelete
  });
}

//finish deletion
function finishDelete() {
  task = {};
  $('.message-wrapper').hide("slow");
  $('.main').removeClass('blur');
  appendToDom();
}

// mark task as completed or vise versa
function changeTaskStatus(){
  var task = {};
  task.id = $(this).parent().data('id');

  $.ajax({
    type: 'PUT',
    data: task,
    url: '/todo',
    success: appendToDom
  });
}
