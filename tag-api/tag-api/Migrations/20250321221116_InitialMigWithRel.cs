using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tag_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigWithRel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserChallenges_ChallengeCards_ChallengeCardId",
                table: "UserChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTransportations_TransportationTypes_TransportationTypeId",
                table: "UserTransportations");

            migrationBuilder.DropIndex(
                name: "IX_UserTransportations_TransportationTypeId",
                table: "UserTransportations");

            migrationBuilder.DropIndex(
                name: "IX_UserChallenges_ChallengeCardId",
                table: "UserChallenges");

            migrationBuilder.DropColumn(
                name: "TransportationTypeId",
                table: "UserTransportations");

            migrationBuilder.DropColumn(
                name: "ChallengeCardId",
                table: "UserChallenges");

            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_UserTransportations_TransportationId",
                table: "UserTransportations",
                column: "TransportationId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_CardId",
                table: "UserChallenges",
                column: "CardId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserChallenges_ChallengeCards_CardId",
                table: "UserChallenges",
                column: "CardId",
                principalTable: "ChallengeCards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTransportations_TransportationTypes_TransportationId",
                table: "UserTransportations",
                column: "TransportationId",
                principalTable: "TransportationTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserChallenges_ChallengeCards_CardId",
                table: "UserChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTransportations_TransportationTypes_TransportationId",
                table: "UserTransportations");

            migrationBuilder.DropIndex(
                name: "IX_UserTransportations_TransportationId",
                table: "UserTransportations");

            migrationBuilder.DropIndex(
                name: "IX_UserChallenges_CardId",
                table: "UserChallenges");

            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "TransportationTypeId",
                table: "UserTransportations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ChallengeCardId",
                table: "UserChallenges",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_UserTransportations_TransportationTypeId",
                table: "UserTransportations",
                column: "TransportationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_ChallengeCardId",
                table: "UserChallenges",
                column: "ChallengeCardId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserChallenges_ChallengeCards_ChallengeCardId",
                table: "UserChallenges",
                column: "ChallengeCardId",
                principalTable: "ChallengeCards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTransportations_TransportationTypes_TransportationTypeId",
                table: "UserTransportations",
                column: "TransportationTypeId",
                principalTable: "TransportationTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
