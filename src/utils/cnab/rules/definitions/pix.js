export const PIX_RULES = [
  { id: "G100", name: "Forma de Iniciação Pix", desc: "Tipo de chave ou forma de iniciação", validation: "oneOf", values: ["01", "02", "03", "04", "05", "06", "07"], options: [
    { value: "01", label: "Chave Pix - Telefone", description: "Iniciação via número de celular." },
    { value: "02", label: "Chave Pix - E-mail", description: "Iniciação via endereço de e-mail." },
    { value: "03", label: "Chave Pix - CPF/CNPJ", description: "Iniciação via documento de identidade." },
    { value: "04", label: "Chave Pix - Aleatória", description: "Iniciação via EVP (Endereço Virtual de Pagamento)." },
    { value: "05", label: "Dados Bancários", description: "Iniciação via Agência e Conta." },
    { value: "06", label: "QR Code Dinâmico", description: "Iniciação via QR Code gerado para uma transação específica." },
    { value: "07", label: "QR Code Estático", description: "Iniciação via QR Code fixo do recebedor." }
  ]},
  { id: "G101", name: "Informação Complementar", desc: "Informação 10, 11 ou 12 (Chave PIX)", validation: "pixKey" },
  { id: "G102", name: "Chave Pix / TXID", desc: "URL, Chave de Endereçamento ou Identificador da Transação", validation: "pixKey" },
  { id: "G103", name: "Tipo de Chave DICT", desc: "Tipo da chave Pix", validation: "oneOf", values: ["1", "2", "3", "4", "5"], options: [
    { value: "1", label: "CPF / CNPJ", description: "Chave baseada no documento do favorecido." },
    { value: "2", label: "E-mail", description: "Chave baseada no endereço de correio eletrônico." },
    { value: "3", label: "Telefone", description: "Chave baseada no número de telefone celular." },
    { value: "4", label: "Chave Aleatória", description: "Chave gerada aleatoriamente pelo DICT." }
  ]}
];
