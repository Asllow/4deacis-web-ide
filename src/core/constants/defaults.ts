export const getSmartDefault = (key: string, type: string): string | number => {
    if (key === "period_ms") return 1000;
    if (key === "freq") return 1000;
    if (key === "ppr") return 360;
    if (key === "channel") return 1;
    if (key === "unit") return 1;
    if (key.includes("port")) return 502;
    if (key === "target_ip") return "192.168.1.100";
    if (key === "topic") return "esp32/telemetria";
    if (key === "operation") return "+";
    if (key.startsWith("num_")) return 1;

    if (type === "number") return 0;
    return "";
};