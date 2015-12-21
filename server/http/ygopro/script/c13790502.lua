--Kozmo Farmgirl
function c13790502.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	-- Banish
	e1:SetDescription(aux.Stringid(13790502,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790502)
	e1:SetCost(c13790502.cost)
	e1:SetTarget(c13790502.sumtg)
	e1:SetOperation(c13790502.sumop)
	c:RegisterEffect(e1)
	--Battle Damage
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13790502,1))
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BATTLE_DAMAGE)
	e2:SetCost(c13790502.thcost)
	e2:SetCondition(c13790502.thcon)
	e2:SetTarget(c13790502.thtg)
	e2:SetOperation(c13790502.thop)
	c:RegisterEffect(e2)
end

function c13790502.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c13790502.spfilter(c,e,tp)
	return (c:IsCode(13790502) or c:IsCode(13790503) or c:IsCode(13790504) or c:IsCode(13790505))
		and c:IsLevelAbove(4) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790502.sumtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>=0
		and Duel.IsExistingMatchingCard(c13790502.spfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
end
function c13790502.sumop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13790502.spfilter,tp,LOCATION_HAND,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end

function c13790502.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,500) end
	Duel.PayLPCost(tp,500)
end
function c13790502.thcon(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp
end
function c13790502.filter(c)
	return (c:IsCode(13790501) or c:IsCode(13790502) or c:IsCode(13790503) or c:IsCode(13790504) or c:IsCode(13790505)) and c:IsAbleToHand()
end
function c13790502.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return 
	Duel.IsExistingMatchingCard(c13790502.filter,tp,LOCATION_DECK,0,1,nil) 
	end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c13790502.thop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13790502.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
