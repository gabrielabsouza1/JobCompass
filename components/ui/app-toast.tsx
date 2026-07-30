type AppToastProps = {
  message: string;
};

export function AppToast({ message }: AppToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-xl">
      {message}
    </div>
  );
}