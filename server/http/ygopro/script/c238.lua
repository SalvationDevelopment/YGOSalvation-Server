--Backup Gardna

function c238.initial_effect(c)
	--equip
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(238,0))
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTarget(c238.target)
	e1:SetOperation(c238.eqop)
	c:RegisterEffect(e1)
	--negate attack
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(238,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetCost(c238.indcost)
	e2:SetOperation(c238.operation)
	c:RegisterEffect(e2)
end

function c238.indcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDiscardable,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,Card.IsDiscardable,1,1,REASON_COST+REASON_DISCARD)
end



function c238.operation(e,tp,eg,ep,ev,re,r,rp)
		Duel.NegateAttack()
	end


function c238.tcfilter(tc,ec)
	return tc:IsFaceup() and ec:CheckEquipTarget(tc)
end
function c238.ecfilter(c,ec)
	return c:GetEquipTarget()==ec
end
function c238.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_SZONE) and c238.ecfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c238.ecfilter,tp,LOCATION_SZONE,LOCATION_SZONE,1,nil,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(238,0))
	local g=Duel.SelectTarget(tp,c238.ecfilter,tp,LOCATION_SZONE,LOCATION_SZONE,1,1,nil,e:GetHandler())
	local ec=g:GetFirst()
	e:SetLabelObject(ec)
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(238,1))
	local tc=Duel.SelectTarget(tp,c238.tcfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,ec:GetEquipTarget(),ec)
end

function c238.eqop(e,tp,eg,ep,ev,re,r,rp)
	local eqc=e:GetLabelObject()
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc=g:GetFirst()
	if tc==eqc then tc=g:GetNext() end
	if not eqc:IsRelateToEffect(e) then return end
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) then
		Duel.SendtoGrave(eqc,REASON_EFFECT)
		return
	end
	Duel.Equip(tp,eqc,tc)
end
