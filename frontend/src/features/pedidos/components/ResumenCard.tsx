import Card from "@/shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
}

function ResumenCard({ titulo, valor }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold">{valor}</p>
    </Card>
  );
}

export default ResumenCard;
