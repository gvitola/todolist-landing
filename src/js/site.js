const url = 'http://www.puerto54.com:8081/api/todoitems';  // URL de la API

let todos = [];
let draggedItemId = null; // Para rastrear el elemento arrastrado


async function getItems() {
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  };
  
  await fetch(url, options)
      .then(response => response.json())
      .then(data => _displayItems(data))
      .catch(error => console.error('Unable to get items.', error))
}

function addItem() {
  const addNameTextbox = document.getElementById('add-name');

  const item = {
    isComplete: false,
    name: addNameTextbox.value.trim()
  };

  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  };

  fetch(url, options)
    .then(response => response.json())
    .then(() => {
      getItems();
      addNameTextbox.value = '';
    })
    .catch(error => console.error('Unable to add item.', error));
}

function deleteItem(id) {
  const options = {
      method: 'DELETE'
  }

  fetch(`${url}/${id}`, options)
    .then(() => getItems())
    .catch(error => console.error('Unable to delete item.', error));
}

function updateItem() {
  const itemId = document.getElementById('edit-id').value;
  const item = {
    id: parseInt(itemId, 10),
    isComplete: document.getElementById('edit-isComplete').checked,
    name: document.getElementById('edit-name').value.trim()
  };

  const options = {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  };

  fetch(`${url}/${itemId}`, options)
    .then(() => getItems())
    .catch(error => console.error('Unable to update item.', error));

  closeEditForm();

  return false;
}

// Nueva función para actualizar la información al ordenar los elementos
function updateItemOrder(newItem) {
  const itemId = newItem.id;
  const item = {
    id: parseInt(itemId, 10),
    isComplete: newItem.checked,
    name: newItem.name
  };
  
  const options = {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  };

  fetch(`${url}/${itemId}`, options)
    .then(() => getItems())
    .catch(error => console.error('Unable to update item order.', error));
}

// -----------------------------------

function displayEditForm(id) {
  const item = todos.find(item => item.id === id);
  
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-isComplete').checked = item.isComplete;
  document.getElementById('editForm').style.display = 'block';

  document.getElementById('addForm').style.display = 'none';

}

function closeEditForm() {
  document.getElementById('editForm').style.display = 'none';
  document.getElementById('addForm').style.display = 'block';
}

function _displayCount(itemCount) {
  const name = (itemCount === 1) ? 'to-do' : 'to-dos';

  document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function _displayItems(data) {
  const tBody = document.getElementById('todos');
  tBody.innerHTML = '';

  _displayCount(data.length);

  if (data.length === 0) {
    document.getElementById('listTable').style.display = 'none';
    document.getElementById('counter').style.display = 'none';
    document.getElementById('addButton').disabled = false;
  } else {
    document.getElementById('listTable').style.display = 'table';
    document.getElementById('counter').style.display = 'block';
    if (data.length >= 24) {
      document.getElementById('addButton').disabled = true;
    } else {
      document.getElementById('addButton').disabled = false;
    }
  }

  data.forEach((item, index, itemsArray) => {
    let isCompleteCheckbox = document.createElement('input');
    isCompleteCheckbox.type = 'checkbox';
    isCompleteCheckbox.disabled = true;
    isCompleteCheckbox.checked = item.isComplete;

    // ---------- se crean las acciones sobre cada item -----------

    let moveIcon = document.createElement('i');
    
    if (index === 0) {
      moveIcon.className = 'fas fa-sort-down'; // Ícono de Font Awesome para drag-and-drop
      moveIcon.setAttribute('onclick', `getDown(${index})`); // Hacer el ícono arrastrable
    } else if (index === itemsArray.length - 1) {
      moveIcon.className = 'fas fa-sort-up'; // Ícono de Font Awesome para drag-and-drop
      moveIcon.setAttribute('onclick', `getUp(${index})`); // Hacer el ícono arrastrable
    } else {
      moveIcon.className = 'fas fa-sort'; // Ícono de Font Awesome para drag-and-drop
      moveIcon.setAttribute('onclick', `startDrag(${item.id})`); // Hacer el ícono arrastrable
    }
    
    let editIcon = document.createElement('i');
    editIcon.className = 'fas fa-edit'; // Ícono de Font Awesome para eliminar
    editIcon.setAttribute('onclick', `displayEditForm(${item.id})`);

    let deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash'; // Ícono de Font Awesome para eliminar
    deleteIcon.setAttribute('onclick', `deleteItem(${item.id})`);

    let tr = tBody.insertRow();

    // ----------- Se agregan los atributos a la fila para Drag & Drop -----------

    tr.setAttribute('draggable', true); // Hacer la fila arrastrable
    tr.dataset.id = item.id;  
    
    let td0 = tr.insertCell(0);
    td0.appendChild(isCompleteCheckbox);

    let td1 = tr.insertCell(1);
    let textNode = document.createTextNode(item.name);
    td1.appendChild(textNode);

    let td2 = tr.insertCell(2);
    td2.appendChild(moveIcon);

    let td3 = tr.insertCell(3);
    td3.appendChild(editIcon);

    let td4 = tr.insertCell(4);
    td4.appendChild(deleteIcon);

    // Eventos de drag-and-drop

    tr.addEventListener('dragstart', () => {
      draggingElement = tr;
      tr.classList.add('dragging');
      const tabla = document.getElementById('listTable');
      tabla.classList.add('drop-zone'); // Agregar clase para resaltar la tabla
    });

    tr.addEventListener('dragend', () => {
        draggingElement = null;
        tr.classList.remove('dragging');
        const tabla = document.getElementById('listTable');
        tabla.classList.remove('drop-zone');
    });

    tr.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    tr.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        const cuerpoTabla = target.parentElement;

        if (target !== draggingElement) {
            cuerpoTabla.insertBefore(draggingElement, target);

            const draggedItemId = draggingElement.dataset.id; // Obtener el ID del elemento arrastrado
            const targetItemId = target.dataset.id; // Obtener el ID del elemento de destino

            const draggedItemIndex = todos.findIndex(item => item.id == draggedItemId); // Obtener el índice del elemento arrastrado
            const targetItemIndex = todos.findIndex(item => item.id == targetItemId); // Obtener el índice del elemento de destino  
            
            updateTableOrder(draggedItemIndex, targetItemIndex); // Actualizar el orden de los elementos en la tabla
        }

        const tabla = document.getElementById('listTable');
        tabla.classList.remove('drop-zone');
        draggingElement = null;
        target.classList.remove('dragging');
    });

  });

  todos = data;
}

// Función para iniciar el arrastre del elemento
function startDrag(itemId) {
  const row = document.querySelector(`tr[data-id="${itemId}"]`); // Buscar la fila por su data-id
  if (row) {
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true
    });
    row.dispatchEvent(dragStartEvent); // Disparar el evento dragstart
  }
}

// getUp elemento
async function getUp(index) {
  const respuesta = await fetch(url);
  const items = await respuesta.json();

  if (index > 0) {
    [items[index - 1].name, items[index].name] = [items[index].name, items[index - 1].name];
    [items[index - 1].isComplete, items[index].isComplete] = [items[index].isComplete, items[index - 1].isComplete];

    updateItemOrder(items[index]);
    updateItemOrder(items[index - 1]);
  }
}

// getDown elemento
async function getDown(index) {
  const respuesta = await fetch(url);
  const items = await respuesta.json();

  if (index < items.length - 1) {
      [items[index].name, items[index + 1].name] = [items[index + 1].name, items[index].name];
      [items[index].isComplete, items[index + 1].isComplete] = [items[index + 1].isComplete, items[index].isComplete];

      updateItemOrder(items[index + 1]);
      updateItemOrder(items[index]);
  }
}

async function updateTableOrder(draggedIndex, targetIndex) {
  const respuesta = await fetch(url);
  const items = await respuesta.json();

  // Crear una copia independiente del elemento arrastrado
  let draggedItem = { ...items[draggedIndex] }; // Usar el operador de propagación para copiar el objeto

  if (draggedIndex > targetIndex) {   
    for (let i = draggedIndex; i > targetIndex; i--) {
        items[i].name = items[i - 1].name;
        items[i].isComplete = items[i - 1].isComplete;
        updateItemOrder(items[i]);
      }  
  } else if (draggedIndex < targetIndex) {
      for (let i = draggedIndex; i < targetIndex; i++) {
        items[i].name = items[i + 1].name;
        items[i].isComplete = items[i + 1].isComplete;
        updateItemOrder(items[i]);
      }
  }

  // Actualizar el elemento arrastrado en su nueva posición
  items[targetIndex].name = draggedItem.name;
  items[targetIndex].isComplete = draggedItem.isComplete;
  updateItemOrder(items[targetIndex]);
 
}