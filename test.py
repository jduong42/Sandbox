import pygame
import sys

# Initialize Pygame
pygame.init()

# Set up the game window
window_width = 800
window_height = 600
window = pygame.display.set_mode((window_width, window_height))
pygame.display.set_caption("Pac-Man")

# Load game assets
pacman_image = pygame.image.load("pacman.png")
pacman_rect = pacman_image.get_rect()
pacman_rect.center = (window_width // 2, window_height // 2)

# Game loop
while True:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # Update game state

    # Render game objects
    window.fill((0, 0, 0))  # Clear the window
    window.blit(pacman_image, pacman_rect)  # Draw Pac-Man

    # Update display
    pygame.display.update()
