/**
 * The service container that holds all the services.
 */
const CONTAINER: Record<string, unknown> = {};

/**
 * Gets a service by name.
 * @param name - The name of the service to get.
 * @returns The service instance. Throws an error if the service does not exist.
 */
export function getService(name: string): unknown {
  const service = CONTAINER[name];

  if (!service) {
    throw new Error(`Error: Service "${name}" does not exist.`);
  }

  return service;
}

/**
 * Add a service to the container.
 * @param name - The name of the service to add.
 * @param service - The service instance to add.
 */
export function addService(name: string, service: unknown): void {
  CONTAINER[name] = service;
}

/**
 * Records a service from the container.
 * @param name - The name of the service to remove.
 */
export function removeService(name: string): void {
  if (CONTAINER[name]) {
    delete CONTAINER[name];
  }
}

/**
 * Clears all services from the container.
 */
export function clearServices(): void {
  for (const name in CONTAINER) {
    delete CONTAINER[name];
  }
}
