import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSettingsSchema, type ContactSettings } from '@arts/shared';
import { useSettings } from '../hooks/queries.js';
import { useUpdateSettings } from '../hooks/mutations.js';
import { ApiError } from '../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
  Spinner,
  Switch,
  useToast,
} from '@arts/ui';

const FIELDS = [
  { key: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '+91 98765 43210' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'hello@artisan.local' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'Jaipur, Rajasthan, India' },
] as const;

const EMPTY: ContactSettings = {
  phone: { enabled: false, value: '' },
  email: { enabled: false, value: '' },
  location: { enabled: false, value: '' },
};

export function ContactSettingsPage() {
  const settingsQuery = useSettings();
  const updateMut = useUpdateSettings();
  const toast = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactSettings>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: EMPTY,
  });

  const settings = settingsQuery.data;
  useEffect(() => {
    if (settings?.contact) reset(settings.contact);
  }, [settings, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateMut.mutateAsync({ contact: values });
      toast.success('Contact details saved.');
    } catch {
      /* surfaced below */
    }
  });

  const apiError = updateMut.error instanceof ApiError ? updateMut.error.message : null;

  if (settingsQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted">
        <Spinner className="text-gold-500" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Storefront" title="Contact" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="mb-6 text-sm text-muted">
            Choose which details appear on your storefront&rsquo;s Contact page. Turn a detail on
            and fill in its value — anything left off stays hidden from customers.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {FIELDS.map(({ key, label, type, placeholder }) => {
              const enabled = watch(`${key}.enabled`);
              const error = errors[key]?.value?.message;
              return (
                <div key={key} className="rounded-lg border border-line/60 p-4">
                  <div className="mb-2.5 flex items-center justify-between gap-4">
                    <label htmlFor={`c-${key}`} className="text-sm font-medium text-fg">
                      {label}
                    </label>
                    <Controller
                      control={control}
                      name={`${key}.enabled`}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label={`Show ${label} on the storefront`}
                        />
                      )}
                    />
                  </div>
                  <Input
                    id={`c-${key}`}
                    type={type}
                    placeholder={placeholder}
                    disabled={!enabled}
                    {...register(`${key}.value`)}
                  />
                  {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
                </div>
              );
            })}

            {apiError ? <p className="text-sm text-danger">{apiError}</p> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMut.isPending}>
                {updateMut.isPending ? <Spinner /> : null}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
