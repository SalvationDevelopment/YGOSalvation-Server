--Raidraptor - Necro Vulture
function c13754010.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(66337215,0))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c13754010.thcost)
	e1:SetTarget(c13754010.thtg)
	e1:SetOperation(c13754010.thop)
	c:RegisterEffect(e1)
end

function c13754010.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,Card.IsSetCard,1,nil,0xba) end
	local g=Duel.SelectReleaseGroup(tp,Card.IsSetCard,1,1,nil,0xba)
	Duel.Release(g,REASON_COST)
end
function c13754010.filter(c)
	return c:IsSetCard(0x95) and c:IsAbleToHand()
end
function c13754010.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_GRAVE and chkc:GetControler()==tp and c13754010.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13754010.filter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c13754010.filter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13754010.thop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
		e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
		e1:SetTargetRange(1,0)
		e1:SetTarget(c13754010.splimit)
		e1:SetReset(RESET_PHASE+RESET_END)
		Duel.RegisterEffect(e1,tp)
	end
end

function c13754010.splimit(e,c,sumtp,sumtype,sumpos,targetp,se)
	return c:IsLocation(LOCATION_EXTRA) and not se:GetHandler():IsSetCard(0x95)
end
