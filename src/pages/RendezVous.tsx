import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { createAppointment } from '@/lib/api';

const isFriday = (date: Date) => date.getDay() === 5;
const isPast = (date: Date) => new Date(date.toDateString()) < new Date(new Date().toDateString());

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  birthDate: z.string().min(1, 'Date de naissance requise').refine((v) => !isNaN(Date.parse(v)), 'Date invalide'),
  appointmentDate: z
    .string()
    .min(1, 'Date de rendez-vous requise')
    .refine((v) => !isNaN(Date.parse(v)), 'Date invalide')
    .refine((v) => !isFriday(new Date(v)), 'Le cabinet est fermé le vendredi')
    .refine((v) => !isPast(new Date(v)), "Veuillez choisir une date à partir d'aujourd'hui"),
  firstTime: z.enum(['oui', 'non'], { required_error: "Veuillez préciser si c'est une première visite" }),
  phone: z
    .string()
    .min(6, 'Numéro requis')
    .regex(/^[+\d][\d\s-]{5,}$/i, 'Numéro invalide'),
});

type FormValues = z.infer<typeof schema>;

const WHATSAPP_NUMBER = '213540802636';

const formatDate = (v: string) => {
  const d = new Date(v);
  return isNaN(d.valueOf()) ? v : d.toLocaleDateString('fr-FR');
};

const RendezVous = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstTime: 'oui' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createAppointment({
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        appointmentDate: values.appointmentDate,
        firstTime: values.firstTime,
        phone: values.phone,
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de la demande. Veuillez réessayer.',
      });
    }

    const message = `Bonjour, je souhaite prendre rendez-vous.\n\nNom et prénom: ${values.lastName} ${values.firstName}\nDate de naissance: ${formatDate(values.birthDate)}\nPremière visite: ${values.firstTime}\nDate souhaitée: ${formatDate(values.appointmentDate)}\nTéléphone: ${values.phone}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    toast({
      title: 'Demande envoyée',
      description: 'Le personnel du cabinet vous contactera pour confirmer le rendez-vous. Merci pour votre confiance.',
    });

    window.open(url, '_blank');
    reset();
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-hero hero-glow text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-36 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Prendre rendez-vous</h1>
        <p className="text-gray-300 mb-8">Tous les champs sont obligatoires. Le cabinet est ouvert tous les jours sauf le vendredi.</p>

        <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-lg shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Votre prénom" {...register('firstName')} />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Votre nom" {...register('lastName')} />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Date de naissance</Label>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full no-date-icon"
                      />
                    )}
                  />
                  {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate.message}</p>}
                </div>
                <div>
                  <Label>Date souhaitée</Label>
                  <Controller
                    name="appointmentDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value + 'T00:00:00'), 'dd/MM/yyyy') : <span>Choisir une date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                          <CalendarUI
                            mode="single"
                            selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                            onSelect={(date) => date && field.onChange(format(date, 'yyyy-MM-dd'))}
                            disabled={(date) => isPast(date) || isFriday(date)}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.appointmentDate && <p className="text-red-400 text-sm mt-1">{errors.appointmentDate.message}</p>}
                </div>
              </div>

              <div>
                <Label>Première visite ?</Label>
                <Controller
                  name="firstTime"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="oui" id="firstTime-oui" />
                        <Label htmlFor="firstTime-oui">Oui</Label>
                        <RadioGroupItem value="non" id="firstTime-non" className="ml-6" />
                        <Label htmlFor="firstTime-non">Non</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.firstTime && <p className="text-red-400 text-sm mt-1">{errors.firstTime.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input id="phone" placeholder="Ex: +213 542 608 623" {...register('phone')} />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div className="pt-2">
                <Button size="lg" className="font-semibold" type="submit" disabled={isSubmitting}>
                  Confirmer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RendezVous;
