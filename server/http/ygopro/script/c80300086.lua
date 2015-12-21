--Gwenhwyfar, Queen of Noble Arms
function c80300086.initial_effect(c)
	--equip
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80300086,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e1:SetCost(c80300086.eqcost)
	e1:SetTarget(c80300086.eqtg)
	e1:SetOperation(c80300086.eqop)
	c:RegisterEffect(e1)
	--atkup
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_EQUIP)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetValue(300)
	c:RegisterEffect(e2)
	--destroy sub
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_EQUIP+EFFECT_TYPE_CONTINUOUS)
	e3:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e3:SetCode(EFFECT_DESTROY_REPLACE)
	e3:SetTarget(c80300086.reptg)
	e3:SetOperation(c80300086.repop)
	c:RegisterEffect(e3)
	--destroy
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e4:SetCode(EVENT_BATTLE_START)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCondition(c80300086.descon)
	e4:SetTarget(c80300086.destg)
	e4:SetOperation(c80300086.desop)
	c:RegisterEffect(e4)
end
function c80300086.eqcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80300086)==0 end
	Duel.RegisterFlagEffect(tp,80300086,RESET_PHASE+PHASE_END,0,1)
end
function c80300086.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x107a)
end
function c80300086.eqtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c80300086.filter(chkc) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c80300086.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	Duel.SelectTarget(tp,c80300086.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c80300086.eqop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	if Duel.GetLocationCount(tp,LOCATION_SZONE)<=0 or tc:GetControler()~=tp or tc:IsFacedown() or not tc:IsRelateToEffect(e) or not c:CheckUniqueOnField(tp) then
		Duel.SendtoGrave(c,REASON_EFFECT)
		return
	end
	Duel.Equip(tp,c,tc,true)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_EQUIP_LIMIT)
	e1:SetReset(RESET_EVENT+0x1fe0000)
	e1:SetValue(c80300086.eqlimit)
	c:RegisterEffect(e1)
end
function c80300086.eqlimit(e,c)
	return c:IsSetCard(0x107a)
end
function c80300086.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return bit.band(r,REASON_EFFECT)~=0 and c:GetEquipTarget():IsAttribute(ATTRIBUTE_LIGHT)  end
	return Duel.SelectYesNo(e:GetOwnerPlayer(),aux.Stringid(80300086,0))
end
function c80300086.repop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT+REASON_REPLACE)
end
function c80300086.descon(e,re,r,rp)
	local tg=e:GetHandler():GetEquipTarget()
	return tg:IsAttribute(ATTRIBUTE_DARK) and (Duel.GetAttacker()==tg or Duel.GetAttackTarget()==tg)
end
function c80300086.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	local tc=Duel.GetAttacker()
	if tc==c:GetEquipTarget() then tc=Duel.GetAttackTarget() end
	if chk==0 then return tc and tc:IsControler(1-tp) end
	local g=Group.FromCards(tc,c:GetEquipTarget())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80300086.desop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetAttacker()
	if tc==c:GetEquipTarget() then tc=Duel.GetAttackTarget() end
	if tc:IsRelateToBattle() and Duel.Destroy(tc,REASON_EFFECT) then
		Duel.BreakEffect()
		Duel.Destroy(c,REASON_EFFECT)
	end
end