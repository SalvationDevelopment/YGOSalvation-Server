--Dragoons of Draconia
function c80100200.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--tohand
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100200,0))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BATTLED)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c80100200.shcon)
	e2:SetTarget(c80100200.shtg)
	e2:SetOperation(c80100200.shop)
	c:RegisterEffect(e2)
end
function c80100200.efilter(c,tp)
	return c:IsType(TYPE_NORMAL) and c:IsControler(tp)
end
function c80100200.shcon(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	local bt=Duel.GetAttackTarget()
	if not bt then return end
	if bt:IsControler(tp) then
		local temp=at
		at=bt
		bt=temp
	end
	
	return at:IsType(TYPE_NORMAL) and bt:IsStatus(STATUS_BATTLE_DESTROYED)
end
function c80100200.shfilter(c)
	return c:IsType(TYPE_NORMAL) and c:IsLevelAbove(4) and c:IsAbleToHand()
end
function c80100200.shtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100200.shfilter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80100200.shop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80100200.shfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
