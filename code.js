// Definición de la clase Node
class Node {
  constructor(value) {
    // Verificar si el valor es un número y no es NaN
    if (!isNaN(value)) {
      this.value = value;
    } else {
      // Convertir el valor a un número flotante solo si es una cadena que contiene un punto decimal
      if (typeof value === "string" && value.includes(".")) {
        this.value = parseFloat(value);
      } else {
        this.value = value;
      }
    }
    this.left = null;
    this.right = null;
  }
}

// Función para construir el árbol de derivación
function buildDerivationTree(expression) {
  let stack = [];
  let operators = ["+", "-", "×", "÷"];
  let operand = "";

  // Dividir la expresión en tokens
  let tokens = expression.match(/\d+(\.\d+)?|[+\-×÷]/g);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (operators.includes(token)) {
      if (operand !== "") {
        stack.push(new Node(parseFloat(operand))); // Convertir el operando a flotante si es necesario
        operand = ""; // Reiniciar el operando
      }
      // Agregar el operador a la pila
      stack.push(new Node(token));
    } else {
      // Construir el operando
      operand += token;
    }
  }

  // Agregar el último operando a la pila si existe
  if (operand !== "") {
    stack.push(new Node(parseFloat(operand)));
  }

  // Construir el árbol recursivamente desde la pila
  while (stack.length > 1) {
    let right = stack.pop();
    let operator = stack.pop();
    let left = stack.pop();
    operator.left = left;
    operator.right = right;
    stack.push(operator);
  }

  return stack[0]; // Retornar el nodo raíz del árbol
}

// Función para imprimir el árbol de derivación
function printDerivationTree(node, element) {
  element.innerHTML = ""; // Vacía el contenido del elemento antes de agregar los nodos del árbol

  if (node == null) return;

  // Llama recursivamente a la función para imprimir los nodos del árbol
  printNode(node, element);

  // Función recursiva para imprimir los nodos del árbol
  function printNode(node, element) {
    // Crea un elemento div para representar el nodo
    let nodeElement = document.createElement("div");
    nodeElement.className = "tree-node";
    nodeElement.textContent =
      node.value instanceof Node ? node.value.value : node.value;

    if (node.left != null) {
      nodeElement.classList.add("operators");
    }

    // Agrega el elemento del nodo al contenedor
    element.appendChild(nodeElement);

    // Si el nodo tiene hijos, crea un elemento div para representar la rama del árbol
    if (node.left !== null || node.right !== null) {
      let branchElement = document.createElement("div");
      branchElement.className = "tree-branch";
      element.appendChild(branchElement);

      // Si el nodo tiene un hijo izquierdo, imprime el hijo izquierdo
      if (node.left !== null) {
        printNode(node.left, element);
        let leftNode = element.lastChild;
        leftNode.classList.add("node-left");
      }

      // Si el nodo tiene un hijo derecho, imprime el hijo derecho
      if (node.right !== null) {
        printNode(node.right, element);
        let rightNode = element.lastChild;
        rightNode.classList.add("node-right");
      }
    }
  }
}

var operators = ["+", "-", "/", "*"];

var box = null;
var last_operation_history = null;
var operator = null;
var equal = null;
var dot = null;

var firstNum = true;

var numbers = [];
var operator_value;
var last_button;
var calc_operator;

var total;

var key_combination = [];

// Array para almacenar el análisis léxico
var lexical_analysis = [];

// Función para mostrar el resultado de la calculadora, construir el árbol de derivación y realizar el análisis léxico
function showCalculationResult(expression) {
  let tree = buildDerivationTree(expression);
  let treeElement = document.getElementById("tree");
  printDerivationTree(tree, treeElement);

  // Realizar el análisis léxico
  addLexicalAnalysis(expression.split(" "));
  printLexicalAnalysis();
}

function button_number(button) {
  operator = document.getElementsByClassName("operator");
  box = document.getElementById("box");
  last_operation_history = document.getElementById("last_operation_history");
  equal = document.getElementById("equal_sign").value;
  dot = document.getElementById("dot").value;

  last_button = button;

  // Si el botón presionado no es un operador ni el signo de igual
  if (!operators.includes(button) && button != equal) {
    if (firstNum) {
      if (button == dot) {
        box.innerText = "0" + dot;
      } else {
        box.innerText = button;
      }
      firstNum = false;
    } else {
      if (box.innerText.length == 1 && box.innerText == 0) {
        if (button == dot) {
          box.innerText += button;
        }
        return;
      }
      if (box.innerText.includes(dot) && button == dot) {
        return;
      }
      if (box.innerText.length == 20) {
        return;
      }

      if (button == dot && box.innerText == "-") {
        box.innerText = "-0" + dot;
      } else {
        box.innerText += button;
      }
    }
  } else {
    if (operator_value != null && button == operator_value) {
      return;
    }

    if (button == "-" && box.innerText == 0) {
      box.innerText = button;
      firstNum = false;
      operator_value = button;
      showSelectedOperator();
      return;
    } else if (operators.includes(button) && box.innerText == "-") {
      return;
    } else if (
      button == "-" &&
      operator_value == "-" &&
      last_operation_history.innerText.includes("=")
    ) {
      return;
    }

    if (operators.includes(button)) {
      if (typeof last_operator != "undefined" && last_operator != null) {
        calc_operator = last_operator;
      } else {
        calc_operator = button;
      }
      if (button == "*") {
        last_operator = "×";
      } else if (button == "/") {
        last_operator = "÷";
      } else {
        last_operator = button;
      }
      operator_value = button;
      firstNum = true;
      showSelectedOperator();
    }

    if (numbers.length == 0) {
      numbers.push(box.innerText);
      if (typeof last_operator != "undefined" && last_operator != null) {
        last_operation_history.innerText = box.innerText + " " + last_operator;
      }
    } else {
      if (numbers.length == 1) {
        numbers[1] = box.innerText;
      }
      var temp_num = box.innerText;

      if (button == equal && calc_operator != null) {
        var total = calculate(numbers[0], numbers[1], calc_operator);
        box.innerText = total;

        if (!last_operation_history.innerText.includes("=")) {
          last_operation_history.innerText += " " + numbers[1] + " =";
        }

        temp_num = numbers[0];

        numbers[0] = total;
        operator_value = null;
        showSelectedOperator();

        var history_arr = last_operation_history.innerText.split(" ");
        history_arr[0] = temp_num;
        last_operation_history.innerText = history_arr.join(" ");

        // Capturar análisis léxico
        addLexicalAnalysis(history_arr);

        // Agregar análisis léxico del resultado
        addBoxContentToLexicalAnalysis(total.toString());

        // Imprimir el resultado léxico
        printLexicalAnalysis();
        // Llamar a la función showCalculationResult con la expresión completa
        showCalculationResult(last_operation_history.innerText);
      } else if (calc_operator != null) {
        last_operation_history.innerText = temp_num + " " + last_operator;
        calc_operator = button;
        numbers = [];
        numbers.push(box.innerText);
      }
    }
  }
}

function showSelectedOperator() {
  var elements = document.getElementsByClassName("operator");

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e68a00";
  }

  if (operator_value == "+") {
    document.getElementById("plusOp").style.backgroundColor = "#ffd11a";
  } else if (operator_value == "-") {
    document.getElementById("subOp").style.backgroundColor = "#ffd11a";
  } else if (operator_value == "*") {
    document.getElementById("multiOp").style.backgroundColor = "#ffd11a";
  } else if (operator_value == "/") {
    document.getElementById("divOp").style.backgroundColor = "#ffd11a";
  }
}

function calculate(num1, num2, operator) {
  if (operator === "+") {
    total = parseFloat(num1) + parseFloat(num2);
  } else if (operator === "-") {
    total = parseFloat(num1) - parseFloat(num2);
  } else if (operator === "*") {
    total = parseFloat(num1) * parseFloat(num2);
  } else if (operator === "/") {
    total = parseFloat(num1) / parseFloat(num2);
  } else {
    if (total == box.innerText) {
      return total;
    } else {
      return box.innerText;
    }
  }
  if (!Number.isInteger(total)) {
    total = total.toPrecision(12);
  }
  return parseFloat(total);
}

function button_clear() {
  window.location.reload();
}

function backspace_remove() {
  box = document.getElementById("box");
  var elements = document.getElementsByClassName("operator");

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e68a00";
  }

  var last_num = box.innerText;
  last_num = last_num.slice(0, -1);

  box.innerText = last_num;

  if (box.innerText.length == 0) {
    box.innerText = 0;
    firstNum = true;
  }
}

function plus_minus() {
  box = document.getElementById("box");

  if (typeof last_operator != "undefined") {
    if (numbers.length > 0) {
      if (operators.includes(last_button)) {
        if (box.innerText == "-") {
          box.innerText = 0;
          firstNum = true;
          return;
        } else {
          box.innerText = "-";
          firstNum = false;
        }
      } else {
        box.innerText = -box.innerText;

        if (numbers.length == 1) {
          numbers[0] = box.innerText;
        } else {
          numbers[1] = box.innerText;
        }
      }
    }
    return;
  }

  if (box.innerText == 0) {
    box.innerText = "-";
    firstNum = false;
    return;
  }
  box.innerText = -box.innerText;
}

function square_root() {
  box = document.getElementById("box");
  var square_num = Math.sqrt(box.innerText);
  box.innerText = square_num;
  numbers.push(square_num);
}

function division_one() {
  box = document.getElementById("box");
  var square_num = 1 / box.innerText;
  box.innerText = square_num;
  numbers.push(square_num);
}

function power_of() {
  box = document.getElementById("box");
  var square_num = Math.pow(box.innerText, 2);
  box.innerText = square_num;
  numbers.push(square_num);
}

function calculate_percentage() {
  var elements = document.getElementsByClassName("operator");
  box = document.getElementById("box");

  if (numbers.length > 0 && typeof last_operator != "undefined") {
    var perc_value = (box.innerText / 100) * numbers[0];
    if (!Number.isInteger(perc_value)) {
      perc_value = perc_value.toFixed(2);
    }
    box.innerText = perc_value;
    numbers.push(box.innerText);

    if (!last_operation_history.innerText.includes("=")) {
      last_operation_history.innerText += " " + numbers[1] + " =";
    }
  } else {
    box.innerText = box.innerText / 100;
  }

  numbers.push(box.innerText);
  var res = calculate(numbers[0], numbers[1], last_operator);
  box.innerText = res;
  operator_value = "=";

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e68a00";
  }
}

function clear_entry() {
  box = document.getElementById("box");

  if (numbers.length > 0 && typeof last_operator != "undefined") {
    box.innerText = 0;
    var temp = numbers[0];
    numbers = [];
    numbers.push(temp);
    firstNum = true;
  }
}

document.addEventListener("keydown", keyPressed);
document.addEventListener("keyup", keyReleased);

function keyPressed(e) {
  e.preventDefault();
  var equal = document.getElementById("equal_sign").value;
  var dot = document.getElementById("dot").value;

  if (e.key == "Delete") {
    button_clear();
    return;
  }

  var isNumber = isFinite(e.key);
  var enterPress;
  var dotPress;
  var commaPress = false;

  if (e.key == "Enter") {
    enterPress = equal;
  }
  if (e.key == ".") {
    dotPress = dot;
  }
  if (e.key == ",") {
    commaPress = true;
  }

  if (
    isNumber ||
    operators.includes(e.key) ||
    e.key == enterPress ||
    e.key == dotPress ||
    commaPress ||
    e.key == "Backspace"
  ) {
    if (e.key == "Enter") {
      button_number(enterPress);
    } else if (e.key == "Backspace") {
      document.getElementById("backspace_btn").style.backgroundColor =
        "#999999";
      backspace_remove();
    } else if (commaPress) {
      button_number(dot);
    } else {
      button_number(e.key);
    }
  }
  if (e.key) {
    key_combination[e.code] = e.key;
  }
}

function keyReleased(e) {
  if (key_combination["ControlLeft"] && key_combination["KeyV"]) {
    navigator.clipboard
      .readText()
      .then((text) => {
        box = document.getElementById("box");
        var isNumber = isFinite(text);
        if (isNumber) {
          var copy_number = text;
          firstNum = true;
          button_number(copy_number);
        }
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  }
  if (key_combination["ControlLeft"] && key_combination["KeyC"]) {
    box = document.getElementById("box");
    navigator.clipboard.writeText(box.innerText);
  }
  key_combination = [];
  e.preventDefault();

  if (e.key == "Backspace") {
    document.getElementById("backspace_btn").style.backgroundColor = "#666666";
  }
}

// Función para agregar el análisis léxico
function addLexicalAnalysis(expressionArr) {
  lexical_analysis = []; // Limpiar el análisis léxico anterior
  var position = 0; // Inicializar la posición en 0
  for (var i = 0; i < expressionArr.length; i++) {
    var type;
    var value = expressionArr[i];

    if (!isNaN(value)) {
      if (value.includes(".")) {
        type = "Decimal";
      } else {
        type = "Entero";
      }
    } else if (
      value === "+" ||
      value === "-" ||
      value === "×" ||
      value === "÷"
    ) {
      type = "Operador";
    } else if (value === "=") {
      type = "Igual";
    }

    var analysis = {
      Linea: 1,
      Tipo: type,
      Valor: value,
      Posicion: position, // Utilizar la posición actual
    };

    lexical_analysis.push(analysis);

    // Incrementar la posición por la longitud del token
    position += value.length;
  }
}

// Función para imprimir el análisis léxico
function printLexicalAnalysis() {
  var lexical_result = document.querySelector(".resultado-lexico");
  lexical_result.innerText = ""; // Limpiar el contenido anterior
  for (var i = 0; i < lexical_analysis.length; i++) {
    var line =
      "Línea " +
      lexical_analysis[i].Linea +
      ", Tipo " +
      lexical_analysis[i].Tipo +
      ", Valor " +
      lexical_analysis[i].Valor +
      ", Posición " +
      lexical_analysis[i].Posicion;
    lexical_result.innerText += line + "\n\n";
  }
}

// Función para agregar el contenido del cuadro a los análisis léxicos
function addBoxContentToLexicalAnalysis(total) {
  box = document.getElementById("box");
  var box_content = total;
  var type;

  // Determinar el tipo de contenido (Entero o Decimal) del resultado
  if (!isNaN(box_content)) {
    if (box_content.includes(".")) {
      type = "Decimal";
    } else {
      type = "Entero";
    }
  }

  // Agregar el análisis léxico del contenido de <p id="box" class="box"> al arreglo lexical_analysis
  var box_analysis = {
    Linea: 2, // Línea 2 (resultado)
    Tipo: type, // Tipo: Determinado según el contenido (entero o decimal)
    Valor: box_content, // Valor: El valor contenido en <p id="box" class="box"> (el resultado)
    Posicion: 0, // Posición: 0 (ya que es el comienzo del contenido del resultado)
  };

  lexical_analysis.push(box_analysis);
}
