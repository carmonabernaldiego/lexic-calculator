import InvalidResultError from "./InvalidResultError.js";

// calculator containers
const calculatorInput = document.querySelector(".screen-input");
const calculatorResult = document.querySelector(".screen-result");
const buttonsContainer = document.querySelector(".buttons-container");

const MAX_INPUT_LEN = 25;
const MAX_RESULT_LEN = 13;

let screenInput = "";
let calculationInput = "";
let currNumber = "";
let userInputString = "";

let lexical_analysis = [];

// digits handlers
const isZeroInputValid = function (targetValue) {
  const firstDigitMatch = currNumber.match(/\d/) ?? [""];
  const firstCurrNumChar = firstDigitMatch[0];

  if (firstCurrNumChar === "0" && !/^0\./.test(currNumber)) {
    if (targetValue === "0") return false;
    if (targetValue !== ".") {
      currNumber = targetValue;
      screenInput = screenInput.slice(0, -1) + currNumber;
      calculationInput = calculationInput.slice(0, -1) + currNumber;
      return false;
    }
  }
  return true;
};

const isDotInputValid = function (targetValue) {
  const lastCurrNumChar = currNumber.slice(-1);
  if ((lastCurrNumChar === "." || currNumber === "") && targetValue === ".") {
    return false;
  }

  if (/\./.test(currNumber) && targetValue === ".") return;

  return true;
};

const isParensInputValid = function (targetValue) {
  const openingParen = screenInput.match(/\(/g) ?? [];
  const closingParen = screenInput.match(/\)/g) ?? [];
  const lastInputChar = screenInput.slice(-1);

  if (
    targetValue === ")" &&
    (openingParen.length <= closingParen.length ||
      lastInputChar === "(" ||
      (Number.isNaN(lastInputChar) && lastInputChar !== ")"))
  ) {
    return false;
  }

  if (
    targetValue === "(" &&
    screenInput !== "" &&
    !Number.isNaN(Number(lastInputChar))
  ) {
    return false;
  }

  if (
    lastInputChar === ")" &&
    (/\(|\./.test(targetValue) || !Number.isNaN(Number(targetValue)))
  ) {
    return false;
  }

  return true;
};

const handleDigits = function (target) {
  const targetValue = target.innerText;

  if (!isZeroInputValid(targetValue)) return;
  if (!isDotInputValid(targetValue)) return;
  if (!isParensInputValid(targetValue)) return;

  if (!/\(|\)/.test(targetValue)) currNumber += targetValue;
  screenInput += targetValue;
  calculationInput += targetValue;

  logUserInput(targetValue); // Registrar la entrada del usuario
};

// operators handler
const handleOperators = function (target) {
  currNumber = "";
  const targetValue = target.innerText;
  const lastInputChar = screenInput.slice(-1);

  if ((screenInput === "" || lastInputChar === "(") && targetValue === "-") {
    currNumber += targetValue;
    calculationInput += targetValue;
    screenInput += targetValue;
    return;
  }

  if (screenInput === "" && targetValue !== "-") return;

  if (
    lastInputChar !== ")" &&
    Number.isNaN(Number(lastInputChar)) &&
    Number.isNaN(Number(targetValue))
  ) {
    return;
  }

  const targetId = target.id;

  if (targetId === "multiply") calculationInput += "*";
  else if (targetId === "divide") calculationInput += "/";
  else calculationInput += targetValue;

  screenInput += targetValue;

  logUserInput(targetValue); // Registrar la entrada del usuario
};

// functionalities handlers
const handleClear = function () {
  userInputString = "";
  currNumber = "";
  screenInput = "";
  calculationInput = "";
  calculatorResult.innerText = 0;
};

const handleDelete = function () {
  userInputString = userInputString.slice(0, -1);
  screenInput = screenInput.slice(0, -1);
  calculationInput = screenInput;
  if (screenInput === "") handleClear();
};

const handleResultLength = function (result, maxLen) {
  return String(result).length > maxLen
    ? Number.parseFloat(result).toExponential(maxLen - 4)
    : result;
};

const handleCalculation = function () {
  if (calculationInput === "") return;

  // Agregar análisis léxico
  addLexicalAnalysis(userInputString);

  currNumber = eval(calculationInput);
  if (Number.isNaN(currNumber)) {
    throw new InvalidResultError("not a number");
  }

  if (!Number.isFinite(currNumber)) {
    throw new InvalidResultError("positive/negative infinity");
  }

  currNumber = String(handleResultLength(currNumber, MAX_RESULT_LEN));
  screenInput = currNumber;
  calculationInput = currNumber;
  calculatorResult.innerText = currNumber;

  // Imprimir análisis léxico
  printLexicalAnalysis();

  // Imprimir arbol derivación
  const derivationTree = buildDerivationTree(userInputString);
  const container = document.getElementById("tree");
  printDerivationTree(derivationTree, container);
};

const handleFunctionalities = function (target) {
  const targetId = target.id;

  if (targetId === "clear") handleClear();
  else if (targetId === "equals") handleCalculation();
  else if (targetId === "delete") handleDelete();

  logUserInput(targetId);
};

const logUserInput = function (input) {
  if (input !== "equals" && input !== "clear" && input !== "delete") {
    userInputString += input;
    //console.log("Entrada del usuario:", userInputString);
  }
};

const isMaxInputLengthReached = function (maxLength) {
  if (screenInput.length >= maxLength) {
    alert("Maximum input size reached");
    return true;
  }

  return false;
};

const buttonsContainerHandler = function (event) {
  const currTarget = event.target;
  const { key } = currTarget.dataset;

  if (key === "digit") {
    if (isMaxInputLengthReached(MAX_INPUT_LEN)) return;
    handleDigits(currTarget);
  } else if (key === "operator") {
    if (isMaxInputLengthReached(MAX_INPUT_LEN)) return;
    handleOperators(currTarget);
  } else if (key === "functionality") {
    handleFunctionalities(currTarget);
  }

  calculatorInput.innerText = screenInput;
};

buttonsContainer.addEventListener("click", (event) =>
  buttonsContainerHandler(event)
);

function addLexicalAnalysis(expression) {
  lexical_analysis = []; // Limpiar el análisis léxico anterior
  var position = 0; // Inicializar la posición en 0

  // Separar la cadena de entrada en tokens
  var tokens = expression.match(/(\d+(\.\d+)?|\+|-|×|÷|=|\(|\))/g);

  if (!tokens) return; // Si no se encuentran tokens, salir de la función

  for (var i = 0; i < tokens.length; i++) {
    var type;
    var value = tokens[i];

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
    } else if (value === "(" || value === ")") {
      type = "Paréntesis";
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
  lexical_result.innerText += userInputString + "\n\n\n";
  for (var i = 0; i < lexical_analysis.length; i++) {
    var line =
      "Token " +
      (i + 1) +
      ": " +
      "Línea " +
      lexical_analysis[i].Linea +
      ", Tipo " +
      lexical_analysis[i].Tipo +
      ", Valor " +
      lexical_analysis[i].Valor +
      ", Posición " +
      lexical_analysis[i].Posicion;
    lexical_result.innerText += line + ".\n\n";
  }
}

// Definir la clase para un nodo del árbol de derivación
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

// Función para construir el árbol de derivación
function buildDerivationTree(expression) {
  const tokens = expression.match(/(\d+(\.\d+)?|\+|-|×|÷|\(|\))/g);

  // Función auxiliar recursiva para construir el árbol
  function buildTree(tokens) {
    if (tokens.length === 0) {
      return null;
    }

    let minPriority = Infinity;
    let minIndex = -1;
    let currentPriority = 0;
    let parenCount = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === "(") {
        parenCount++;
      } else if (token === ")") {
        parenCount--;
      } else if (parenCount === 0 && ["+", "-"].includes(token)) {
        currentPriority = 1;
        minIndex = i;
      } else if (
        parenCount === 0 &&
        ["×", "÷"].includes(token) &&
        currentPriority <= 1
      ) {
        currentPriority = 2;
        minIndex = i;
      }
    }

    if (minIndex === -1) {
      if (tokens[0] === "(") {
        // Remove the parentheses
        return buildTree(tokens.slice(1, tokens.length - 1));
      } else {
        // No operator found, assume the token is a number
        return new TreeNode(parseFloat(tokens[0]));
      }
    }

    const node = new TreeNode(tokens[minIndex]);

    node.left = buildTree(tokens.slice(0, minIndex));
    node.right = buildTree(tokens.slice(minIndex + 1));

    return node;
  }

  return buildTree(tokens);
}

// Función para imprimir el árbol de derivación
// Función para imprimir el árbol de derivación
function printDerivationTree(node, element) {
  element.innerHTML = ""; // Vacía el contenido del elemento antes de agregar los nodos del árbol

  if (node == null) return;

  // Llama recursivamente a la función para imprimir los nodos del árbol
  printNode(node, element, 0); // Comienza con el nivel 0

  // Función recursiva para imprimir los nodos del árbol
  function printNode(node, element, level) {
    // Crea un elemento div para representar el nodo
    let nodeElement = document.createElement("div");
    nodeElement.className = "tree-node";
    nodeElement.textContent = node.value;

    // Agrega espacios según el nivel para visualizar la estructura del árbol
    nodeElement.style.marginLeft = `${level * 20}px`;

    // Agrega el elemento del nodo al contenedor
    element.appendChild(nodeElement);

    // Si el nodo tiene hijos, crea un elemento div para representar la rama del árbol
    if (node.left !== null || node.right !== null) {
      // Si el nodo tiene un hijo izquierdo, imprime el hijo izquierdo
      if (node.left !== null) {
        printNode(node.left, element, level + 1); // Incrementa el nivel para el hijo izquierdo
      } else {
        // Si el nodo no tiene hijo izquierdo, imprime un espacio en blanco para mantener la estructura
        let emptyNode = document.createElement("div");
        emptyNode.style.marginLeft = `${(level + 1) * 20}px`; // Incrementa el nivel para el hijo izquierdo
        element.appendChild(emptyNode);
      }

      // Si el nodo tiene un hijo derecho, imprime el hijo derecho
      if (node.right !== null) {
        printNode(node.right, element, level + 1); // Incrementa el nivel para el hijo derecho
      } else {
        // Si el nodo no tiene hijo derecho, imprime un espacio en blanco para mantener la estructura
        let emptyNode = document.createElement("div");
        emptyNode.style.marginLeft = `${(level + 1) * 20}px`; // Incrementa el nivel para el hijo derecho
        element.appendChild(emptyNode);
      }
    }
  }
}
