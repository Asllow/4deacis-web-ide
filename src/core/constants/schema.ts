export interface IBlockSchema {
    category: string;
    description: string;
    events_in: string[];
    events_out: string[];
    data_in: string[];
    data_out: string[];
    config: Record<string, string>;
}

export const BLOCK_SCHEMA: Record<string, IBlockSchema> = {
    ECycle: {
        category: "Timers",
        description: "Gera pulsos de evento em intervalos regulares.",
        events_in: [],
        events_out: ["EV_OUT"],
        data_in: [],
        data_out: [],
        config: { period_ms: "number" }
    },
    AnalogInput: {
        category: "IO",
        description: "Lê o valor bruto de um pino ADC.",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: [],
        data_out: ["DATA_OUT"],
        config: { adc_unit: "number", adc_channel: "number" }
    },
    PwmOutput: {
        category: "IO",
        description: "Gera sinal PWM pelo hardware LEDC.",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: ["DUTY_CYCLE"],
        data_out: [],
        config: { gpio: "number", freq: "number" }
    },
    McpwmMotor: {
        category: "IO",
        description: "Aciona ponte H usando MCPWM (Ponto Flutuante -100 a 100).",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: ["DUTY_CYCLE"],
        data_out: [],
        config: { timer_group: "number", gpio_pwm_a: "number", gpio_pwm_b: "number" }
    },
    EncoderInput: {
        category: "IO",
        description: "Lê pulsos de quadratura (fase A e B) para controle de posição/ângulo em radianos.",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: [],
        data_out: ["ANGLE"],
        config: { gpio_a: "number", gpio_b: "number", ppr: "number", high_limit: "number", low_limit: "number" }
    },
    MathNode: {
        category: "Math",
        description: "Processa cálculos matemáticos estáticos (+, -, *, /) em C++.",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: ["IN_1", "IN_2"],
        data_out: ["OUT"],
        config: { operation: "string" }
    },
    Sandbox: {
        category: "Math",
        description: "Máquina Virtual Lua para controle complexo (LQR, PID). Entradas e saídas de dados são dinâmicas.",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: ["IN_0", "IN_N..."], 
        data_out: ["OUT_0", "OUT_N..."],
        config: { 
            script_b64: "string (hidden/modal)", 
            num_in: "number", 
            num_out: "number" 
        }
    },
    SerialMonitor: {
        category: "Debug",
        description: "Imprime valores de dados no terminal serial do ESP32.",
        events_in: ["REQ"],
        events_out: [],
        data_in: ["IN_0", "IN_N..."], 
        data_out: [],
        config: { num_in: "number" }
    },
    UdpPublisher: {
        category: "Redes",
        description: "Empacota dados de 4 bytes e transmite via rede UDP.",
        events_in: ["SEND"],
        events_out: [],
        data_in: ["PAYLOAD_IN"],
        data_out: [],
        config: { target_ip: "string", target_port: "number" }
    },
    UdpSubscriber: {
        category: "Redes",
        description: "Escuta silenciosamente a rede e injeta os bytes crus recebidos na malha local.",
        events_in: [],
        events_out: ["IND"],
        data_in: [],
        data_out: ["DATA_OUT"],
        config: { port: "number" }
    },
    MqttPublisher: {
        category: "Redes",
        description: "Publica telemetria em um broker MQTT.",
        events_in: ["REQ"],
        events_out: ["CNF"],
        data_in: ["PAYLOAD"],
        data_out: [],
        config: { broker_uri: "string", target_topic: "string" }
    },
    ModbusTcpServer: {
        category: "Redes",
        description: "Expõe registradores para leitura e escrita por clientes Modbus/TCP (SCADA).",
        events_in: ["UPDATE"],
        events_out: ["IND"],
        data_in: ["REG_IN"],
        data_out: ["REG_OUT"],
        config: { port: "number" }
    }
};