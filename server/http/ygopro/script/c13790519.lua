--Igknight Magnum
function c13790519.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--scale change
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c13790519.sccon)
	e2:SetTarget(c13790519.sctg)
	e2:SetOperation(c13790519.scop)
	c:RegisterEffect(e2)
end
function c13790519.sccon(e,tp,eg,ep,ev,re,r,rp)
	local seq=e:GetHandler():GetSequence()
	local tc=Duel.GetFieldCard(e:GetHandlerPlayer(),LOCATION_SZONE,13-seq)
	return tc and tc:IsSetCard(0xc6)
end
function c13790519.filter(c)
	return c:IsRace(RACE_WARRIOR) and c:IsAttribute(ATTRIBUTE_FIRE) and c:IsAbleToHand()
end
function c13790519.sctg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790519.filter,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK+LOCATION_GRAVE)
end
function c13790519.scop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local c1=Duel.GetFieldCard(tp,LOCATION_SZONE,6)
	local c2=Duel.GetFieldCard(tp,LOCATION_SZONE,7)
	local g=Group.CreateGroup()
	if c1 and c1:IsDestructable() then g:AddCard(c1) end
	if c2 and c2:IsDestructable() then g:AddCard(c2) end
	if g:GetCount()>0 then
		local ct=Duel.Destroy(g,REASON_EFFECT)
		if ct>0 then
			local fg=Duel.GetMatchingGroup(c13790519.filter,tp,LOCATION_DECK+LOCATION_GRAVE,0,nil)
			if fg:GetCount()>0 then
				Duel.BreakEffect()
				Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
				local sg=fg:Select(tp,1,1,nil)
				Duel.SendtoHand(sg,nil,REASON_EFFECT)
				Duel.ConfirmCards(1-tp,sg)
			end
		end
	end
end
