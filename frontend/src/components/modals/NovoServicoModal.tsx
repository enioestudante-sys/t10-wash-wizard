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

interface NovoServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicoId?: string | null;
}

export function NovoServicoModal({
  isOpen,
  onClose,
  servicoId,
}: NovoServicoModalProps) {
  const { tiposLavagem, addTipoLavagem, updateTipoLavagem } = useApp();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (servicoId) {
      const s = tiposLavagem.find((t) => t.id === servicoId);
      if (s) {
        setNome(s.nome || "");
        setPreco(String(s.preco || ""));
        setDescricao(s.descricao || "");
      }
    } else {
      setNome("");
      setPreco("");
      setDescricao("");
    }
    setErro("");
  }, [isOpen, servicoId, tiposLavagem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(preco);

    if (!nome.trim() || !Number.isFinite(precoNum) || precoNum < 0) {
      setErro("Preencha o nome e um preço válido.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const payload = {
        nome: nome.trim(),
        preco: precoNum,
        descricao: descricao.trim(),
      };

      if (servicoId) {
        await updateTipoLavagem(servicoId, payload);
        toast.success("Serviço atualizado com sucesso.");
      } else {
        await addTipoLavagem(payload);
        toast.success("Serviço cadastrado com sucesso.");
      }

      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar serviço";
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
            {servicoId ? "Editar Serviço" : "Cadastrar Serviço"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os dados do serviço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && <p className="text-destructive text-sm">{erro}</p>}

          <div>
            <label className="block text-base font-semibold mb-1.5 text-foreground">
              Nome do Serviço *
            </label>
            <input
              className="input-t10"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lavagem Completa"
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold mb-1.5 text-foreground">
              Preço (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-t10"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold mb-1.5 text-foreground">
              Descrição
            </label>
            <textarea
              className="input-t10 min-h-[80px] resize-y"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Opcional..."
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
              {loading ? "Salvando..." : "Salvar Serviço"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
