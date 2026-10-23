import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MovimentacaoEstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId?: string | null;
}

export function MovimentacaoEstoqueModal({
  isOpen,
  onClose,
  produtoId,
}: MovimentacaoEstoqueModalProps) {
  const { produtos, addMovimentacao } = useApp();

  const [selectedProdutoId, setSelectedProdutoId] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProdutoId(produtoId || "");
    setTipo("entrada");
    setQuantidade("");
    setObservacao("");
    setErro("");
  }, [isOpen, produtoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtdNum = Number(quantidade);

    if (!selectedProdutoId || !Number.isFinite(qtdNum) || qtdNum <= 0) {
      setErro("Informe um produto válido e quantidade maior que zero.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      await addMovimentacao({
        produto_id: selectedProdutoId,
        tipo,
        quantidade: qtdNum,
        observacao,
      });

      toast.success(
        `Movimentação de ${tipo === "entrada" ? "entrada" : "saída"} realizada!`,
      );
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao movimentar estoque";
      setErro(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Movimentar Estoque
          </DialogTitle>
          <DialogDescription className="sr-only">
            Registre entradas e saídas de insumos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && <p className="text-destructive text-sm">{erro}</p>}

          <div>
            <label className="block text-base font-semibold mb-1.5 text-foreground">
              Produto *
            </label>
            <select
              className="input-t10"
              value={selectedProdutoId}
              onChange={(e) => setSelectedProdutoId(e.target.value)}
              required
            >
              <option value="">Selecione um produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} (Atual: {p.quantidade} {p.unidade})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-base font-semibold mb-1.5 text-foreground">
                Tipo de Operação
              </label>
              <select
                className="input-t10"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "entrada" | "saida")}
              >
                <option value="entrada">Entrada (+)</option>
                <option value="saida">Saída (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold mb-1.5 text-foreground">
                Quantidade *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-t10"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold mb-1.5 text-foreground">
              Observação
            </label>
            <input
              className="input-t10"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Reposição de estoque / Consumo"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-secondary text-secondary-foreground font-bold h-12 rounded-lg hover:bg-secondary/80 transition-all text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground font-bold h-12 rounded-lg hover:brightness-110 transition-all text-base disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
