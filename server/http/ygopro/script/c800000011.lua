--Heroic Challenger - Clasp Sword
function c800000011.initial_effect(c)
	--ss success
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(800000011,0))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c800000011.condition)
	e1:SetCost(c800000011.cost)
	e1:SetTarget(c800000011.target)
	e1:SetOperation(c800000011.operation)
	c:RegisterEffect(e1)
end

function c800000011.condition(e,tp,eg,ep,ev,re,r,rp)
	if not re then return false end
	local rc=re:GetHandler()
	return rc:IsSetCard(0x6f) and rc:IsType(TYPE_MONSTER)
end

function c800000011.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,800000011)==0 end
	Duel.RegisterFlagEffect(tp,800000011,RESET_PHASE+PHASE_END,0,1)
end

function c800000011.filter(c)
	return c:IsSetCard(0x6f) and c:IsType(TYPE_MONSTER) and c:IsAbleToHand()
end
function c800000011.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c800000011.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c800000011.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c800000011.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end