using Microsoft.EntityFrameworkCore;
using tag_api.Models;

namespace tag_api.Data
{
    public class TagDbContext: DbContext
    {
        public TagDbContext(DbContextOptions<TagDbContext> options) : base(options) { }

        public DbSet<ChallengeCard> ChallengeCards { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Penalty> Penalties { get; set; }
        public DbSet<TransportationType> TransportationTypes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserChallenge> UserChallenges { get; set; }
        public DbSet<UserItem> UserItems { get; set; }
        public DbSet<UserTransportation> UserTransportations { get; set; }
        public DbSet<UserPenalty> UserPenalties { get; set; }

        // Configuring relationships (if any are required)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Example for configuring a composite key (UserChallenge)
            modelBuilder.Entity<UserChallenge>()
                .HasKey(uc => new { uc.UserId, uc.CardId });

            // Relationships
            modelBuilder.Entity<UserItem>()
                .HasOne(ui => ui.User)
                .WithMany()
                .HasForeignKey(ui => ui.UserId);

            modelBuilder.Entity<UserItem>()
                .HasOne(ui => ui.Item)
                .WithMany()
                .HasForeignKey(ui => ui.ItemId);

            modelBuilder.Entity<UserTransportation>()
                .HasOne(ut => ut.User)
                .WithMany()
                .HasForeignKey(ut => ut.UserId);

            modelBuilder.Entity<UserTransportation>()
                .HasOne(ut => ut.TransportationType)
                .WithMany()
                .HasForeignKey(ut => ut.TransportationId);

            modelBuilder.Entity<UserPenalty>()
                .HasOne(up => up.User)
                .WithMany()
                .HasForeignKey(up => up.UserId);

            modelBuilder.Entity<UserPenalty>()
                .HasOne(up => up.Penalty)
                .WithMany()
                .HasForeignKey(up => up.PenaltyId);
        }
    }
}
