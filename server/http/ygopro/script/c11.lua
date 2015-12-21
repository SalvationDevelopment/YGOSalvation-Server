--No.11 ビッグ·アイ
--FIXED BY STORM WOLF
function c11.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,7,2)
	c:EnableReviveLimit()
	--attack up
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_CONTROL)
	e1:SetDescription(aux.Stringid(11,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c11.cost)
	e1:SetTarget(c11.target)
	e1:SetOperation(c11.operation)
	c:RegisterEffect(e1)
	--Immunities
 	local e2=Effect.CreateEffect(coffee)
 	e2:SetType(EFFECT_TYPE_SINGLE)
 	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
 	e2:SetValue(c11.indes)
 	c:RegisterEffect(e2)
 	local e3=Effect.CreateEffect(coffee)
 	e3:SetType(EFFECT_TYPE_SINGLE)
 	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
 	e3:SetRange(LOCATION_MZONE)
 	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
 	e3:SetValue(c11.indval)
 	c:RegisterEffect(e3)

end
c11.xyz_number=11
function c11.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST)
		and e:GetHandler():GetAttackAnnouncedCount()==0 end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
	e:GetHandler():RegisterEffect(e1)
end
function c11.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_MZONE and chkc:GetControler()~=tp and chkc:IsControlerCanBeChanged() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsControlerCanBeChanged,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g=Duel.SelectTarget(tp,Card.IsControlerCanBeChanged,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,g,1,0,0)
end
function c11.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and not Duel.GetControl(tc,tp) then
		if not tc:IsImmuneToEffect(e) and tc:IsAbleToChangeControler() then
			Duel.Destroy(tc,REASON_EFFECT)
		end
	end
end

function c11.indes(e,c)
 return not c:IsSetCard(0x48)
end

function c11.indval(e,re)
 if not re then return false end
 local ty=re:GetActiveType()
 return not re:GetOwner():IsSetCard(0x48)
end