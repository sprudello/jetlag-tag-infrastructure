using Microsoft.EntityFrameworkCore;
using tag_api.Models;

namespace TestBecauseHUUUH.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options)
            : base(options)
        {
        }

        public DbSet<ChallengeCard> ChallengeCards { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Penalty> Penalties { get; set; }
        public DbSet<TransportationType> TransportationTypes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserChallenge> UserChallenges { get; set; }
        public DbSet<UserItem> UserItems { get; set; }
        public DbSet<UserPenalty> UserPenalties { get; set; }
        public DbSet<UserTransportation> UserTransportations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the UserChallenge relationships
            modelBuilder.Entity<UserChallenge>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserChallenges)
                .HasForeignKey(uc => uc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserChallenge>()
                .HasOne(uc => uc.ChallengeCard)
                .WithMany(cc => cc.UserChallenges)
                .HasForeignKey(uc => uc.CardId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure the UserItem relationships
            modelBuilder.Entity<UserItem>()
                .HasOne(ui => ui.User)
                .WithMany(u => u.UserItems)
                .HasForeignKey(ui => ui.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserItem>()
                .HasOne(ui => ui.Item)
                .WithMany(i => i.UserItems)
                .HasForeignKey(ui => ui.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure the UserPenalty relationships
            modelBuilder.Entity<UserPenalty>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserPenalties)
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserPenalty>()
                .HasOne(up => up.Penalty)
                .WithMany(p => p.UserPenalties)
                .HasForeignKey(up => up.PenaltyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure the UserTransportation relationships
            modelBuilder.Entity<UserTransportation>()
                .HasOne(ut => ut.User)
                .WithMany(u => u.UserTransportations)
                .HasForeignKey(ut => ut.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserTransportation>()
                .HasOne(ut => ut.TransportationType)
                .WithMany(t => t.UserTransportations)
                .HasForeignKey(ut => ut.TransportationId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}